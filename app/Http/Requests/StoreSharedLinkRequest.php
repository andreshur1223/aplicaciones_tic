<?php

namespace App\Http\Requests;

use App\Models\SharedLink;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class StoreSharedLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $expiresAt = $this->input('expires_at');
        $maxDownloads = $this->input('max_downloads');

        if ($expiresAt === '' || $expiresAt === null) {
            $expiresAt = null;
        } elseif (is_string($expiresAt) && str_contains($expiresAt, 'T')) {
            $expiresAt = str_replace('T', ' ', $expiresAt);
            if (strlen($expiresAt) === 16) {
                $expiresAt .= ':00';
            }
        }

        $this->merge([
            'expires_at' => $expiresAt,
            'max_downloads' => ($maxDownloads === '' || $maxDownloads === null) ? null : (int) $maxDownloads,
            'application_id' => $this->input('application_id') !== null && $this->input('application_id') !== ''
                ? (int) $this->input('application_id')
                : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'application_id' => ['required', 'integer', 'exists:applications,id'],
            'expires_at' => ['nullable', 'date'],
            'max_downloads' => ['nullable', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->filled('application_id')
                && SharedLink::where('application_id', $this->application_id)->exists()) {
                $validator->errors()->add(
                    'application_id',
                    'Esta aplicación ya tiene un enlace compartible. Use el existente o elimínelo antes de crear otro.'
                );
            }

            if ($this->filled('expires_at')) {
                try {
                    if (Carbon::parse($this->expires_at)->lte(now())) {
                        $validator->errors()->add('expires_at', 'La fecha de expiración debe ser futura.');
                    }
                } catch (\Throwable) {
                    $validator->errors()->add('expires_at', 'Fecha de expiración no válida.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'application_id.required' => 'Seleccione una aplicación.',
            'application_id.exists' => 'La aplicación seleccionada no existe.',
            'max_downloads.min' => 'El máximo de descargas debe ser al menos 1.',
        ];
    }
}
