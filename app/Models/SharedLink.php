<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedLink extends Model
{
    protected $fillable = [
        'application_id', 'token', 'expires_at', 'max_downloads',
        'current_downloads', 'active',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'active' => 'boolean',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function hasReachedMaxDownloads(): bool
    {
        return $this->max_downloads !== null
            && $this->current_downloads >= $this->max_downloads;
    }

    public function canDownload(): bool
    {
        return $this->active
            && ! $this->isExpired()
            && ! $this->hasReachedMaxDownloads()
            && $this->application?->active;
    }

    public function unavailableReason(): ?string
    {
        if (! $this->active) {
            return 'Este enlace compartido ha sido desactivado.';
        }

        if ($this->isExpired()) {
            return 'Este enlace compartido ha expirado.';
        }

        if ($this->hasReachedMaxDownloads()) {
            return 'Se alcanzó el número máximo de descargas permitidas para este enlace.';
        }

        if (! $this->application) {
            return 'La aplicación asociada ya no existe.';
        }

        if (! $this->application->active) {
            return 'La aplicación ya no está disponible para descarga.';
        }

        return null;
    }
}
