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
        $query = Task::with(['project:id,name', 'users:id,name'])
            ->whereHas('project', fn($q) => $q->where('status', 'active'));

        if (!$request->user()->isAdmin()) {
            $userId = $request->user()->id;
            $query->where(function ($q) use ($userId) {
                $q->whereHas('project', fn($sq) => $sq->where('user_id', $userId))
                  ->orWhereHas('users', fn($sq) => $sq->where('users.id', $userId));
            });
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('user_id')) {
            $query->whereHas('users', fn($q) => $q->where('users.id', $request->user_id));
        }

        $sort = $request->get('sort', 'created_at');
        $dir  = $request->get('dir', 'desc');
        if (in_array($sort, ['created_at', 'due_date', 'priority'])) {
            if ($sort === 'priority') {
                $query->orderByRaw("CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END " . ($dir === 'asc' ? 'ASC' : 'DESC'));
            } else {
                $query->orderBy($sort, $dir === 'asc' ? 'asc' : 'desc');
            }
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
            'due_date'    => 'nullable|date|after_or_equal:today',
            'project_id'  => 'required|integer|exists:projects,id',
            'user_ids'    => 'nullable|array',
            'user_ids.*'  => 'integer|exists:users,id',
        ]);

        $project = Project::findOrFail($validated['project_id']);
        if ($project->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($project->status === 'archived') {
            return response()->json(['message' => 'Cannot create a task in an archived project.'], 422);
        }

        $task = Task::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'] ?? 'todo',
            'priority'    => $validated['priority'] ?? 'medium',
            'due_date'    => $validated['due_date'] ?? null,
            'project_id'  => $validated['project_id'],
        ]);

        if (!empty($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }

        return response()->json($task->load(['project:id,name', 'users:id,name']), 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->gate($request, $task);

        return response()->json(
            $task->load(['project:id,name', 'users:id,name', 'comments.user:id,name'])
        );
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->gate($request, $task);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|string|in:todo,in_progress,done',
            'priority'    => 'sometimes|string|in:low,medium,high',
            'due_date'    => 'nullable|date|after_or_equal:today',
            'project_id'  => 'sometimes|integer|exists:projects,id',
            'user_ids'    => 'nullable|array',
            'user_ids.*'  => 'integer|exists:users,id',
        ]);

        if (($validated['status'] ?? null) === 'done' && $task->project->status === 'archived') {
            return response()->json(['message' => 'Cannot complete a task in an archived project.'], 422);
        }

        $task->update(array_diff_key($validated, ['user_ids' => true]));

        if (array_key_exists('user_ids', $validated)) {
            $task->users()->sync($validated['user_ids'] ?? []);
        }

        return response()->json($task->load(['project:id,name', 'users:id,name']));
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->gate($request, $task);
        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }

    private function gate(Request $request, Task $task): void
    {
        $userId = $request->user()->id;
        if (
            $task->project->user_id !== $userId &&
            !$task->users()->where('users.id', $userId)->exists() &&
            !$request->user()->isAdmin()
        ) {
            abort(403, 'Unauthorized');
        }
    }
}
