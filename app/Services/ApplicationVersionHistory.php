<?php

namespace App\Services;

use App\Models\Application;
use App\Models\ApplicationVersion;

class ApplicationVersionHistory
{
    public function __construct(
        protected InstallerStorage $installerStorage
    ) {}

    public function archiveCurrent(Application $application): ApplicationVersion
    {
        return ApplicationVersion::create([
            'application_id' => $application->id,
            'version' => $application->version,
            'file_name' => $application->file_name,
            'file_path' => $application->file_path,
            'file_size' => $application->file_size,
            'mime_type' => $application->mime_type,
            'archived_at' => now(),
        ]);
    }

    /**
     * @param  int  $maxVersionsTotal  Total de versiones (activa + archivadas).
     */
    public function prune(Application $application, int $maxVersionsTotal): void
    {
        $maxArchived = max(0, $maxVersionsTotal - 1);

        while ($application->versions()->count() > $maxArchived) {
            $oldest = $application->versions()->orderBy('archived_at')->first();
            if (! $oldest) {
                break;
            }
            $this->installerStorage->delete($oldest->file_path);
            $oldest->delete();
        }
    }

    public function deleteVersion(ApplicationVersion $version): void
    {
        $this->installerStorage->delete($version->file_path);
        $version->delete();
    }

    public function deleteAllFor(Application $application): void
    {
        $application->versions()->each(function (ApplicationVersion $version) {
            $this->deleteVersion($version);
        });
    }

    public function clampMaxVersions(int $requested): int
    {
        $limit = (int) config('repositorio.max_versions_limit', 20);
        $default = (int) config('repositorio.default_max_versions', 5);

        return min(max($requested ?: $default, 1), $limit);
    }
}
