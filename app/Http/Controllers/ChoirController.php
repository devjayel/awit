<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChoirRequest;
use App\Http\Resources\ChoirResource;
use App\Models\Choir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChoirController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $choirs = Choir::latest()->paginate(10);

        return Inertia::render('choirs/index', [
            'choirs' => ChoirResource::collection($choirs),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ChoirRequest $request)
    {
        try {
            $choir = Choir::create([
                ...$request->validated(),
                'uuid' => Str::uuid(),
                'code' => Str::upper(Str::random(8)),
            ]);

            return back()->with('success', 'Choir member added successfully.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return back()->with('error', 'Failed to add choir member. Please try again.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ChoirRequest $request, Choir $choir)
    {
        try {
            $choir->update($request->validated());

            return back()->with('success', 'Choir member updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update choir member. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Choir $choir)
    {
        try {
            $choir->delete();

            return back()->with('success', 'Choir member deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete choir member. Please try again.');
        }
    }
}
