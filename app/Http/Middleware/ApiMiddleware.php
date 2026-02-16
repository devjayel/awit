<?php

namespace App\Http\Middleware;

use App\Models\Choir;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);
              if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'You must login first.'
            ], 401);
        }

        $rul = Choir::where('token', $token)->first();
        if (!$rul) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to access this resource.'
            ], 401);
        }

        return $next($request);
    }

    
    private function extractToken(Request $request): ?string
    {
        return $request->bearerToken() ?? $request->header('X-Token') ?? $request->query('token');
    }
}
