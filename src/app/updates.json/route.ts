import { release } from "@/lib/product";
export const dynamic = "force-static";
export function GET() {
  return Response.json({
    schemaVersion: 1,
    repository: release.repository,
    repositoryId: release.repositoryId,
    version: release.version,
    releaseUrl: release.url,
    contentHash: release.contentHash,
    changelogSha: release.changelog.sha,
    presentation: {
      version: release.presentation.version,
      sourceCommit: release.presentation.sourceCommit,
      archiveSha256: release.presentation.archiveSha256,
      captures: release.presentation.captures.length,
    },
    updatedAt: release.checkedAt,
  });
}
