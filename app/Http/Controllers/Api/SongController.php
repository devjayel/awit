<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApiSongResource;
use App\Models\Song;
use Illuminate\Http\Request;

class SongController extends Controller
{
    public function index(Request $request){
        $songs = Song::with('assets')->orderBy("created_at","desc")->paginate(10);
        return ApiSongResource::collection($songs);
    }

    public function show(string $uuid){
        $song = Song::with('assets')->where('uuid', $uuid)->firstOrFail();
        return new ApiSongResource($song);
    }

    public function search(Request $request){
        $query = Song::with('assets');

        // Search functionality
        if ($request->has('q')) {
            $search = $request->input('q');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        // Filter by active status
        if ($request->has('active')) {
            $query->where('active', $request->input('active'));
        }

        $songs = $query->orderBy("created_at","desc")->paginate(10);
        return ApiSongResource::collection($songs);
    }
}
