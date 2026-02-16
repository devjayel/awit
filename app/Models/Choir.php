<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Choir extends Model
{
    protected $fillable = [
        'uuid',
        'email',
        'name',
        'level',
        'role',
        'code',
        'token',
        'voice_designation',
    ];
}
