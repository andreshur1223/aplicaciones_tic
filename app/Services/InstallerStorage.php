<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InstallerStorage
{
    public function disk(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        return Storage::disk('installers');
    }

    public function store(UploadedFile $file): array
    {
        $safeName = $this->sanitizeFileName($file->getClientOriginalName());
        $storedName = Str::uuid().'_'.$safeName;
        $path = $this->disk()->putFileAs(
            config('repositorio.installers_path'),
            $file,
            $storedName
        );

        return [
            'file_name' => $safeName,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
        ];
    }

    public function delete(?string $path): void
    {
        if ($path && $this->disk()->exists($path)) {
            $this->disk()->delete($path);
        }
    }

    public function fullPath(string $path): string
    {
        return $this->disk()->path($path);
    }

    public function exists(string $path): bool
    {
        return $this->disk()->exists($path);
    }

    public function sanitizeFileName(string $name): string
    {
        $name = basename($name);
        $name = preg_replace('/[^a-zA-Z0-9._\-]/', '_', $name) ?? 'file';

        return $name ?: 'file';
    }
}
