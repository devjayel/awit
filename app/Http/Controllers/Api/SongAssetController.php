<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SongAsset;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;

class SongAssetController extends Controller
{
    /**
     * Download a song asset file
     */
    public function download(string $uuid): HttpResponse
    {
        $asset = SongAsset::where('uuid', $uuid)->firstOrFail();

        if (!Storage::disk('public')->exists($asset->path)) {
            abort(404, 'File not found.');
        }

        $file = Storage::disk('public')->get($asset->path);
        
        // Determine MIME type based on file extension
        $extension = pathinfo($asset->path, PATHINFO_EXTENSION);
        $mimeTypes = [
            'mp3' => 'audio/mpeg',
            'mp4' => 'video/mp4',
            'pdf' => 'application/pdf',
        ];
        
        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
        
        // Get the original filename or use the asset name
        $filename = "{$asset->name}.$extension";

        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Accept-Ranges', 'bytes')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
