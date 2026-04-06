<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Only return tasks belonging to the authenticated user's projects
        $query = Task::whereHas('project', fn($q) => $q->where('user_id', $request->user()->id))
            ->with(['project:id,name', 'users:id,name'])
            ->latest();

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|string|in:todo,in_progress,done',
            'priority'    => 'sometimes|string|in:low,medium,high',
            'due_date'    => 'nullable|date',
            'project_id'  => 'required|integer|exists:projects,id',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'integer|exists:users,id',
        ]);

        // Verify project belongs to user
        $project = Project::findOrFail($validated['project_id']);
        if ($project->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task = Task::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'] ?? 'todo',
            'priority'    => $validated['priority'] ?? 'medium',
            'due_date'    => $validated['due_date'] ?? null,
            'project_id'  => $validated['project_id'],
        ]);

        if (!empty($validated['assignee_ids'])) {
            $task->users()->sync($validated['assignee_ids']);
        }

        return response()->json(
            $task->load(['project:id,name', 'users:id,name']),
            201
        );
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        return response()->json(
            $task->load(['project:id,name', 'users:id,name', 'comments.user:id,name'])
        );
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $validated = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'status'       => 'sometimes|string|in:todo,in_progress,done',
            'priority'     => 'sometimes|string|in:low,medium,high',
            'due_date'     => 'nullable|date',
            'project_id'   => 'sometimes|integer|exists:projects,id',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'integer|exists:users,id',
        ]);

        $task->update(array_filter($validated, fn($v, $k) => $k !== 'assignee_ids', ARRAY_FILTER_USE_BOTH));

        if (array_key_exists('assignee_ids', $validated)) {
            $task->users()->sync($validated['assignee_ids'] ?? []);
        }

        return response()->json(
            $task->load(['project:id,name', 'users:id,name'])
        );
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }

    private function authorizeTask(Request $request, Task $task): void
    {
        if (
            $task->project->user_id !== $request->user()->id &&
            !$request->user()->isAdmin()
        ) {
            abort(403, 'Unauthorized');
        }
    }
}
