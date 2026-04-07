<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'email'                 => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'current_password'      => 'required_with:password|string',
            'password'              => ['nullable', 'confirmed', Password::defaults()],
        ]);

        if (isset($validated['current_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors'  => ['current_password' => ['Current password is incorrect.']],
                ], 422);
            }
        }

        if (isset($validated['name']))     $user->name  = $validated['name'];
        if (isset($validated['email']))    $user->email = $validated['email'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);

        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'role']));
    }
}
