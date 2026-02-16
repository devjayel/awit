<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SongAsset extends Model
{
    protected $fillable = [
        'uuid',
        'song_id',
        'name',
        'type',
        'path',
        'active',
    ];

    public function song()
    {
        return $this->belongsTo(Song::class);
    }
}
