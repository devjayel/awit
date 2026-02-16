<?php

namespace Database\Seeders;

use App\Models\Choir;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChoirSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Choir::create([
            'uuid' => '123e4567-e89b-12d3-a456-426614174000',
            'name' => 'JL Romero Juanitas',
            'email' => 'jlromerojuanitas223@gmail.com',
            'level' => 'Beginner',
            'role' => 'Member',
            'code' => '11916339',
            'voice_designation' => 'Bass 1',
        ]);
    }
}
