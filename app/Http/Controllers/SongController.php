<?php

namespace App\Http\Controllers;

use App\Http\Requests\SongRequest;
use App\Http\Resources\SongResource;
use App\Models\Song;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SongController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $songs = Song::latest()->paginate(10);

        return Inertia::render('songs/index', [
            'songs' => SongResource::collection($songs),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SongRequest $request)
    {
        try {
            $validated = $request->validated();
            
            $song = Song::create([
                ...$validated,
                'uuid' => Str::uuid(),
                'active' => $validated['active'] ?? true,
            ]);

            return back()->with('success', 'Song created successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create song. Please try again.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SongRequest $request, Song $song)
    {
        try {
            $validated = $request->validated();
            
            $song->update([
                ...$validated,
                'active' => $validated['active'] ?? $song->active,
            ]);

            return back()->with('success', 'Song updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update song. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Song $song)
    {
        try {
            $song->delete();

            return back()->with('success', 'Song deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete song. Please try again.');
        }
    }
}
