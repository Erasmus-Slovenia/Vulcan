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

        // Admins see all projects; regular users see only their own
        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
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
        $this->gate($request, $project);

        return response()->json(
            $project->load(['tasks.assignee:id,name', 'user:id,name'])->loadCount('tasks')
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
