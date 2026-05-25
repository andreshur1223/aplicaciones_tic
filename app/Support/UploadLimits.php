<?php

namespace App\Support;

class UploadLimits
{
    public static function parseIniSize(string|false $value): int
    {
        if ($value === false || $value === '') {
            return 0;
        }

        $value = trim($value);
        $unit = strtolower(substr($value, -1));
        $number = (int) $value;

        return match ($unit) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => (int) $value,
        };
    }

    public static function effectiveMaxBytes(): int
    {
        $appMax = (int) config('repositorio.max_upload_size_kb') * 1024;
        $phpMax = min(
            self::parseIniSize(ini_get('upload_max_filesize')),
            self::parseIniSize(ini_get('post_max_size'))
        );

        if ($phpMax <= 0) {
            return $appMax;
        }

        return min($appMax, $phpMax);
    }

    public static function toHuman(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2).' GB';
        }
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        }

        return $bytes.' B';
    }

    public static function summary(): array
    {
        $effective = self::effectiveMaxBytes();

        return [
            'app_max_kb' => (int) config('repositorio.max_upload_size_kb'),
            'app_max_human' => self::toHuman((int) config('repositorio.max_upload_size_kb') * 1024),
            'php_upload_max_filesize' => ini_get('upload_max_filesize') ?: '—',
            'php_post_max_size' => ini_get('post_max_size') ?: '—',
            'effective_max_bytes' => $effective,
            'effective_max_human' => self::toHuman($effective),
            'default_max_versions' => (int) config('repositorio.default_max_versions', 5),
            'max_versions_limit' => (int) config('repositorio.max_versions_limit', 20),
        ];
    }
}
