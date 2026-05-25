<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $extensions = config('repositorio.allowed_extensions');
        $maxKb = config('repositorio.max_upload_size_kb');

        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'version' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'instructions' => ['nullable', 'string'],
            'os' => ['nullable', 'string', 'max:100'],
            'architecture' => ['nullable', 'string', 'max:50'],
            'requires_admin' => ['sometimes', 'boolean'],
            'active' => ['sometimes', 'boolean'],
            'visible_in_catalog' => ['sometimes', 'boolean'],
            'requires_download_password' => ['sometimes', 'boolean'],
            'download_password' => [
                'required_if:requires_download_password,1,true',
                'nullable',
                'string',
                'min:4',
                'max:100',
            ],
            'keep_version_history' => ['sometimes', 'boolean'],
            'max_versions_to_keep' => [
                'required_if:keep_version_history,1,true',
                'integer',
                'min:1',
                'max:'.(int) config('repositorio.max_versions_limit', 20),
            ],
            'file' => ['required', 'file', 'max:'.$maxKb],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $file = $this->file('file');
            if (! $file) {
                return;
            }

            $ext = strtolower($file->getClientOriginalExtension());
            $allowed = config('repositorio.allowed_extensions');

            if (! in_array($ext, $allowed, true)) {
                $validator->errors()->add('file', 'Extensión no permitida. Permitidas: '.implode(', ', $allowed));
            }
        });
    }
}
