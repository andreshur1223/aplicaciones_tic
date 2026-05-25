<?php

return [
    // Por defecto 2 GB (instaladores pesados, p. ej. 350+ MB). Ajustar en .env si hace falta.
    'max_upload_size_kb' => (int) env('REPOSITORIO_MAX_UPLOAD_KB', 2097152),
    'allowed_extensions' => [
        'exe', 'msi', 'zip', 'rar', '7z', 'pdf', 'doc', 'docx',
        'xls', 'xlsx', 'bat', 'ps1', 'cfg',
    ],
    'script_extensions' => ['bat', 'ps1'],
    'installers_path' => 'installers',
    // Versiones archivadas: total incluye la activa (ej. 5 = 1 activa + hasta 4 anteriores).
    'default_max_versions' => (int) env('REPOSITORIO_DEFAULT_MAX_VERSIONS', 5),
    'max_versions_limit' => (int) env('REPOSITORIO_MAX_VERSIONS_LIMIT', 20),
];
