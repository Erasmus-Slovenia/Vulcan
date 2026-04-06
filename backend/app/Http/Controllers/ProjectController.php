<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::where('user_id', $request->user()->id)
            ->withCount('tasks')
            ->latest()
            ->get();

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|string|in:active,paused,done',
        ]);

        $project = Project::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($project->loadCount('tasks'), 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        return response()->json(
            $project->load(['tasks.users', 'user'])->loadCount('tasks')
        );
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|string|in:active,paused,done',
        ]);

        $project->update($validated);

        return response()->json($project->loadCount('tasks'));
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $project->delete();

        return response()->json(['message' => 'Project deleted']);
    }

    private function authorizeProject(Request $request, Project $project): void
    {
        if ($project->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }
    }
}
