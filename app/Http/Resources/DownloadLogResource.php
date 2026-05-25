<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DownloadLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_id' => $this->application_id,
            'application' => new ApplicationResource($this->whenLoaded('application')),
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'downloaded_at' => $this->downloaded_at,
            'created_at' => $this->created_at,
        ];
    }
}
