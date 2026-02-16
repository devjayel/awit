<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('throttle:60,1')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
});

Route::middleware(['auth.api', 'throttle:60,1'])->group(function () {
    Route::post('/validate-token', [\App\Http\Controllers\Api\AuthController::class, 'validateToken']);
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);

    Route::get('/songs', [\App\Http\Controllers\Api\SongController::class, 'index']);
    Route::get('/songs/search', [\App\Http\Controllers\Api\SongController::class, 'search']);
    Route::get('/songs/{uuid}', [\App\Http\Controllers\Api\SongController::class, 'show']);
    
    Route::get('/song-assets/{uuid}/download', [\App\Http\Controllers\Api\SongAssetController::class, 'download']);
});
