<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationVersion extends Model
{
    protected $fillable = [
        'application_id',
        'version',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'archived_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
