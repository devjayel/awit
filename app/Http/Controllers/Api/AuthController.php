<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApiChoirResource;
use App\Models\Choir;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'code' => 'required|string',
        ]);

        $choir = Choir::where('code', $credentials['code'])->first();
        if (! $choir) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
        $token = Str::random(60);
        $choir->token = $token;
        $choir->save();

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => new ApiChoirResource($choir),
        ], 200);
    }

    private function extractToken(Request $request): ?string
    {
        return $request->bearerToken() ?? $request->header('X-Token') ?? $request->query('token');
    }

    public function validateToken(Request $request)
    {
        $token = $this->extractToken($request);

        $choir = Choir::where('token', $token)->first();
        if (! $choir) {
            return response()->json(['success' => false,'message' => 'Invalid token'], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token is valid',
            'user' => new ApiChoirResource($choir),
        ], 200);
    }

    public function logout(Request $request)
    {
        $token = $this->extractToken($request);

        $choir = Choir::where('token', $token)->first();
        if ($choir) {
            $choir->token = null;
            $choir->save();
        }

        return response()->json(['success' => true, 'message' => 'Logout successful'], 200);
    }
}
