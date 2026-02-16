<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('song_assets', function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->foreignId('song_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type'); // mp4, mp3, pdf
            $table->string('path');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('song_assets');
    }
};
