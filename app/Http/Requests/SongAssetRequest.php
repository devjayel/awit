<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SongAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'song_id' => ['required', 'exists:songs,id'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['mp3', 'mp4', 'pdf'])],
            'active' => ['sometimes', 'boolean'],
        ];

        // Add file validation based on type
        if ($this->isMethod('post')) {
            $rules['file'] = ['required', 'file', function ($attribute, $value, $fail) {
                $type = $this->input('type');
                $mimeTypes = [
                    'mp3' => ['audio/mpeg', 'audio/mp3'],
                    'mp4' => ['video/mp4'],
                    'pdf' => ['application/pdf'],
                ];

                if ($type && isset($mimeTypes[$type])) {
                    $file = $value;
                    if (!in_array($file->getMimeType(), $mimeTypes[$type])) {
                        $fail("The {$attribute} must be a valid {$type} file.");
                    }
                }
            }];
        } else if ($this->hasFile('file')) {
            $rules['file'] = ['nullable', 'file', function ($attribute, $value, $fail) {
                $type = $this->input('type');
                $mimeTypes = [
                    'mp3' => ['audio/mpeg', 'audio/mp3'],
                    'mp4' => ['video/mp4'],
                    'pdf' => ['application/pdf'],
                ];

                if ($type && isset($mimeTypes[$type])) {
                    $file = $value;
                    if (!in_array($file->getMimeType(), $mimeTypes[$type])) {
                        $fail("The {$attribute} must be a valid {$type} file.");
                    }
                }
            }];
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'song_id' => 'song',
            'name' => 'asset name',
            'type' => 'file type',
            'file' => 'file',
            'active' => 'active status',
        ];
    }
}
