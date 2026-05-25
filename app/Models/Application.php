<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    protected $fillable = [
        'category_id', 'name', 'slug', 'version', 'description', 'instructions',
        'os', 'architecture', 'requires_admin', 'file_name', 'file_path',
        'file_size', 'mime_type', 'download_count', 'active',
        'keep_version_history', 'max_versions_to_keep',
        'visible_in_catalog', 'requires_download_password', 'download_password_hash',
    ];

    protected $hidden = [
        'download_password_hash',
    ];

    protected function casts(): array
    {
        return [
            'requires_admin' => 'boolean',
            'active' => 'boolean',
            'visible_in_catalog' => 'boolean',
            'requires_download_password' => 'boolean',
            'keep_version_history' => 'boolean',
            'max_versions_to_keep' => 'integer',
            'file_size' => 'integer',
            'download_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function downloadLogs(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }

    public function sharedLinks(): HasMany
    {
        return $this->hasMany(SharedLink::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ApplicationVersion::class)->orderByDesc('archived_at');
    }
}
