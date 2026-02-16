<?php

namespace App\Http\Controllers;

use App\Http\Requests\SongAssetRequest;
use App\Http\Resources\SongAssetResource;
use App\Models\Song;
use App\Models\SongAsset;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SongAssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(string $songUuid): Response
    {
        $song = Song::where('uuid', $songUuid)->firstOrFail();
        $assets = $song->assets()->latest()->paginate(10);

        return Inertia::render('songs/assets/index', [
            'song' => [
                'id' => $song->id,
                'uuid' => $song->uuid,
                'name' => $song->name,
            ],
            'assets' => SongAssetResource::collection($assets),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SongAssetRequest $request)
    {
        try {
            $data = $request->validated();
            
            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $type = $data['type'];
                $path = $file->store("song-assets/{$type}", 'public');
                $data['path'] = $path;
            }

            $asset = SongAsset::create([
                ...$data,
                'uuid' => Str::uuid(),
                'active' => $request->input('active', true),
            ]);

            return back()->with('success', 'Song asset created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create asset. Please try again.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SongAssetRequest $request, SongAsset $songAsset)
    {
        try {
            $data = $request->validated();

            // Handle file upload if a new file is provided
            if ($request->hasFile('file')) {
                // Delete old file
                if ($songAsset->path && Storage::disk('public')->exists($songAsset->path)) {
                    Storage::disk('public')->delete($songAsset->path);
                }

                $file = $request->file('file');
                $type = $data['type'];
                $path = $file->store("song-assets/{$type}", 'public');
                $data['path'] = $path;
            }

            $songAsset->update($data);

            return back()->with('success', 'Song asset updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update asset. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SongAsset $songAsset)
    {
        try {
            // Delete the file from storage
            if ($songAsset->path && Storage::disk('public')->exists($songAsset->path)) {
                Storage::disk('public')->delete($songAsset->path);
            }

            $songAsset->delete();

            return back()->with('success', 'Song asset deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete asset. Please try again.');
        }
    }

    /**
     * Serve the file with proper headers for viewing
     */
    public function serve(SongAsset $songAsset): HttpResponse
    {
        if (!Storage::disk('public')->exists($songAsset->path)) {
            abort(404, 'File not found.');
        }

        $file = Storage::disk('public')->get($songAsset->path);
        
        // Determine MIME type based on file extension
        $extension = pathinfo($songAsset->path, PATHINFO_EXTENSION);
        $mimeTypes = [
            'mp3' => 'audio/mpeg',
            'mp4' => 'video/mp4',
            'pdf' => 'application/pdf',
        ];
        
        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'inline')
            ->header('Accept-Ranges', 'bytes')
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
