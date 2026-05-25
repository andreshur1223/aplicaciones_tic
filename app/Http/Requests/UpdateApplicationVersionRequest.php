<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicationVersionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'version' => ['required', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'version.required' => 'La versión es obligatoria.',
        ];
    }
}
