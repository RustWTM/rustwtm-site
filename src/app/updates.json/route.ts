import { release } from "@/lib/product";
export const dynamic = "force-static";
export function GET() {
  return Response.json({
    repository: release.repository,
    repositoryId: release.repositoryId,
    version: release.version,
    releaseUrl: release.url,
    contentHash: release.contentHash,
    changelogSha: release.changelog.sha,
    updatedAt: release.checkedAt,
  });
}
