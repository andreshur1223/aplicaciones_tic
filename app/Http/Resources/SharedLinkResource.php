<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SharedLinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'application' => new ApplicationResource($this->whenLoaded('application')),
            'token' => $this->token,
            'share_url' => url('/share/'.$this->token),
            'download_url' => url('/share/'.$this->token.'/download'),
            'expires_at' => $this->expires_at,
            'max_downloads' => $this->max_downloads,
            'current_downloads' => $this->current_downloads,
            'active' => $this->active,
            'can_download' => $this->canDownload(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
