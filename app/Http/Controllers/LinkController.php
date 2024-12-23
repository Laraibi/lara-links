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
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'url' => ['required', 'url', 'max:2048'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create the link
            $link = link::create([
                'original' => $request->url,
                'user_id' => Auth::id(),
                'code' => link::generateUniqueCode(), //auto generated code
            ]);

            return redirect()->back()->with('flash', [
                'type' => 'success',
                'data' => [
                    'id' => $link->id,
                    'url' => $link->url,
                    'code' => $link->code,
                    'short_url' => url("/{$link->code}"),
                    'created_at' => $link->created_at
                ]
            ]);

            // return response()->json([
            //     'success' => true,
            //     'message' => 'Short link created successfully',
            //     'data' => [
            //         'id' => $link->id,
            //         'url' => $link->url,
            //         'code' => $link->code,
            //         'short_url' => url("/{$link->code}"),
            //         'created_at' => $link->created_at
            //     ]
            // ], 201);
        } catch (ValidationException $e) {
            return redirect()->back()->withErrors([
                'error' => config('app.debug') ? $e->getMessage() : 'validation failed'
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while creating the short link'
            ]);
        }
    }
}
