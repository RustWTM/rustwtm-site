"""Validate a bounded public release image package; never extract archive paths."""
import argparse
import hashlib
import io
import json
import re
import sys
import zipfile
from pathlib import Path

MAX_ARCHIVE = 64 * 1024 * 1024
MAX_IMAGE = 4 * 1024 * 1024


def unpack(data, destination, version, commit, repository_id):
    if len(data) > MAX_ARCHIVE:
        raise ValueError("Website media exceeds the archive size limit")
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        if len(names) != len(set(names)) or not 4 <= len(names) <= 41:
            raise ValueError("Invalid or duplicate website media entries")
        manifest_entry = archive.getinfo("manifest.json")
        if manifest_entry.file_size > 256 * 1024:
            raise ValueError("Website manifest exceeds the size limit")
        manifest = json.loads(archive.read("manifest.json"))
        if manifest.get("schemaVersion") != 1 or manifest.get("repositoryId") != repository_id or manifest.get("version") != version or manifest.get("sourceCommit") != commit:
            raise ValueError("Website media identity or release mismatch")
        captures = manifest.get("captures")
        if not isinstance(captures, list) or not 3 <= len(captures) <= 40:
            raise ValueError("Invalid website capture count")
        ids, payloads, total = set(), [], 0
        for capture in captures:
            name = capture.get("id", "")
            if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name) or name in ids or capture.get("path") != f"images/{name}.webp":
                raise ValueError("Invalid or duplicate website capture path")
            ids.add(name)
            for field, limit in (("label", 80), ("title", 160), ("description", 1200)):
                if not isinstance(capture.get(field), str) or not 1 <= len(capture[field]) <= limit:
                    raise ValueError("Invalid website capture text")
            if capture.get("color") not in ("cpu", "memory", "network", "disk", "accent"):
                raise ValueError("Invalid website capture color")
            if any(type(capture.get(field)) is not int or not 1 <= capture[field] <= 4096 for field in ("width", "height")):
                raise ValueError("Invalid website capture dimensions")
            if not re.fullmatch(r"[a-f0-9]{64}", capture.get("sha256", "")):
                raise ValueError("Invalid website capture hash")
            entry = archive.getinfo(capture["path"])
            if entry.file_size > MAX_IMAGE or (entry.external_attr >> 16) & 0o170000 not in (0, 0o100000):
                raise ValueError("Invalid website media entry")
            with archive.open(entry) as stream:
                payload = stream.read(MAX_IMAGE + 1)
            total += len(payload)
            if len(payload) > MAX_IMAGE or total > MAX_ARCHIVE or hashlib.sha256(payload).hexdigest() != capture["sha256"]:
                raise ValueError("Website capture checksum mismatch")
            if len(payload) < 20 or payload[:4] != b"RIFF" or payload[8:12] != b"WEBP" or int.from_bytes(payload[4:8], "little") + 8 != len(payload):
                raise ValueError("Invalid WebP capture")
            payloads.append((name, payload))
        if not {"processes", "performance", "overview"}.issubset(ids) or manifest.get("hero") not in ids:
            raise ValueError("Missing core website captures")
        if set(names) != {"manifest.json", *(capture["path"] for capture in captures)}:
            raise ValueError("Unexpected website archive entries")
        destination.mkdir(parents=True, exist_ok=True)
        for name, payload in payloads:
            (destination / f"{name}.webp").write_bytes(payload)
        return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--destination", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--commit", required=True)
    parser.add_argument("--repository-id", type=int, required=True)
    args = parser.parse_args()
    result = unpack(sys.stdin.buffer.read(MAX_ARCHIVE + 1), args.destination, args.version, args.commit, args.repository_id)
    print(json.dumps(result, ensure_ascii=False))
