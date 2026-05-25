<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $ext = pathinfo($this->file_name, PATHINFO_EXTENSION);

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'slug' => $this->slug,
            'version' => $this->version,
            'description' => $this->description,
            'instructions' => $this->instructions,
            'os' => $this->os,
            'architecture' => $this->architecture,
            'requires_admin' => $this->requires_admin,
            'file_name' => $this->file_name,
            'file_size' => $this->file_size,
            'file_size_human' => $this->formatBytes($this->file_size),
            'mime_type' => $this->mime_type,
            'download_count' => $this->download_count,
            'active' => $this->active,
            'visible_in_catalog' => $this->visible_in_catalog,
            'requires_download_password' => $this->requires_download_password,
            'has_download_password' => $this->when(
                $request->is('api/admin/*'),
                fn () => ! empty($this->download_password_hash)
            ),
            'keep_version_history' => $this->keep_version_history,
            'max_versions_to_keep' => $this->max_versions_to_keep,
            'is_script' => in_array(strtolower($ext), config('repositorio.script_extensions'), true),
            'download_url' => url('/download/'.$this->slug),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'archived_versions_count' => $this->when(
                isset($this->versions_count),
                fn () => (int) $this->versions_count
            ),
        ];
    }

    protected function formatBytes(int $bytes): string
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
}
