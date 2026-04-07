<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request, Task $task): JsonResponse
    {
        $this->gateTask($request, $task);

        return response()->json(
            $task->comments()->with('user:id,name')->latest()->get()
        );
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $this->gateTask($request, $task);

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $comment = $task->comments()->create([
            'content' => $validated['content'],
            'user_id' => $request->user()->id,
        ]);

        return response()->json($comment->load('user:id,name'), 201);
    }

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        if ($comment->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }

    private function gateTask(Request $request, Task $task): void
    {
        if (
            $task->project->user_id !== $request->user()->id &&
            $task->assignee_id !== $request->user()->id &&
            !$request->user()->isAdmin()
        ) {
            abort(403, 'Unauthorized');
        }
    }
}
