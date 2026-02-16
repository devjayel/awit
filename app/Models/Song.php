<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Song extends Model
{
    protected $fillable = [
        'uuid',
        'name',
        'category',
        'description',
        'active'
    ];

    public function assets()
    {
        return $this->hasMany(SongAsset::class);
    }
}
