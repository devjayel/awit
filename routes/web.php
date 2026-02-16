<?php

use App\Http\Controllers\ChoirController;
use App\Http\Controllers\SongAssetController;
use App\Http\Controllers\SongController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $songs = \App\Models\Song::with(['assets' => function ($query) {
                $query->whereIn('type', ['mp3', 'mp4', 'pdf'])
                    ->where('active', true);
            }])
            ->where('active', true)
            ->get()
            ->map(function ($song) {
                return [
                    'id' => $song->id,
                    'uuid' => $song->uuid,
                    'name' => $song->name,
                    'category' => $song->category ?? 'Uncategorized',
                    'description' => $song->description,
                    'assets' => $song->assets->map(function ($asset) {
                        return [
                            'id' => $asset->id,
                            'uuid' => $asset->uuid,
                            'name' => $asset->name,
                            'type' => $asset->type,
                            'url' => route('song-assets.serve', ['songAsset' => $asset->uuid]),
                        ];
                    }),
                ];
            });

        $stats = [
            'totalChoirs' => \App\Models\Choir::count(),
            'totalSongs' => \App\Models\Song::where('active', true)->count(),
            'totalMp3s' => \App\Models\SongAsset::where('type', 'mp3')->where('active', true)->count(),
            'totalAssets' => \App\Models\SongAsset::where('active', true)->count(),
        ];

        return Inertia::render('dashboard', [
            'songs' => $songs,
            'stats' => $stats,
        ]);
    })->name('dashboard');

    Route::get('tos', function () {
        return Inertia::render('tos');
    })->name('tos');

    Route::resource('choirs', ChoirController::class)->except(['show', 'create', 'edit']);
    
    // Songs routes
    Route::resource('songs', SongController::class)->except(['show', 'create', 'edit']);
    
    // Song assets routes - nested under songs using UUID
    Route::get('songs/{songUuid}/assets', [SongAssetController::class, 'index'])->name('songs.assets.index');
    Route::post('song-assets', [SongAssetController::class, 'store'])->name('song-assets.store');
    Route::put('song-assets/{songAsset:uuid}', [SongAssetController::class, 'update'])->name('song-assets.update');
    Route::delete('song-assets/{songAsset:uuid}', [SongAssetController::class, 'destroy'])->name('song-assets.destroy');
    Route::get('song-assets/{songAsset:uuid}/serve', [SongAssetController::class, 'serve'])->name('song-assets.serve');
});

require __DIR__.'/settings.php';
