<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::withCount('tasks')->latest();

        // Admins see all projects; regular users see their own + projects they're assigned to
        if (!$request->user()->isAdmin()) {
            $userId = $request->user()->id;
            $query->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                  ->orWhereHas('tasks.users', fn($sq) => $sq->where('users.id', $userId));
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|string|in:active,archived',
        ]);

        $project = Project::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status'  => $validated['status'] ?? 'active',
        ]);

        return response()->json($project->loadCount('tasks'), 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        // Users can view a project they own OR are assigned to a task in
        if (!$request->user()->isAdmin()
            && $project->user_id !== $request->user()->id
            && !$project->tasks()->whereHas('users', fn($q) => $q->where('users.id', $request->user()->id))->exists()
        ) {
            abort(403, 'Unauthorized');
        }

        return response()->json(
            $project->load(['tasks.users:id,name', 'user:id,name'])->loadCount('tasks')
        );
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->gate($request, $project);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|string|in:active,archived',
        ]);

        $project->update($validated);

        return response()->json($project->loadCount('tasks'));
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->gate($request, $project);

        if ($project->hasActiveTasks()) {
            return response()->json([
                'message' => 'Cannot delete a project with active tasks. Complete or remove them first.',
                'has_active_tasks' => true,
            ], 422);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted']);
    }

    private function gate(Request $request, Project $project): void
    {
        if ($project->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }
}
