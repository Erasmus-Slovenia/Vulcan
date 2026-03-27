<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_user(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $response = $this->actingAs($admin)->postJson('/api/users', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'user',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_non_admin_cannot_create_user(): void
    {
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $response = $this->actingAs($user)->postJson('/api/users', [
            'name' => 'Should Not Work',
            'email' => 'shouldnotwork@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'user',
        ]);

        $response->assertStatus(403);
    }
}
