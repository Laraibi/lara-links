<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\link;
use Illuminate\Support\Facades\Auth;

class LinkController extends Controller
{
    //

    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|url|max:2048',
        ]);

        try {
            $link = link::create([
                'original' => $request->url,
                'user_id' => Auth::id(),
                'code' => link::generateUniqueCode(), // Extracted logic
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Link shortened successfully!',
                'data' => [
                    'id' => $link->id,
                    'original_url' => $link->original,
                    'short_url' => url("/{$link->code}"),
                    'created_at' => $link->created_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
