#!/bin/bash
echo "Vulcan Dev Stack starting..."

# Backend (Laravel)
(cd backend && php artisan serve > /dev/null 2>&1) &
BACKEND_PID=$!

# Frontend (React)
(cd frontend && npm run dev > /dev/null 2>&1) &
FRONTEND_PID=$!

echo "Laravel Backend API: http://localhost:8000"
echo "React Frontend: http://localhost:5173"
echo "PostgreSQL: vulcan DB ready"
echo "Press Ctrl+C to stop..."

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
