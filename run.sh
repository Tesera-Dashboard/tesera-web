#!/bin/bash

# Tesera - Local Development Run Script

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nStopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Starting Tesera Backend (FastAPI)..."
cd backend
# Activate virtual environment and start FastAPI
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo "Starting Tesera Frontend (Next.js)..."
cd frontend
# Start Next.js development server
npm run dev &
FRONTEND_PID=$!
cd ..

echo "--------------------------------------------------------"
echo "✅ Tesera is running locally!"
echo "📡 Backend API: http://127.0.0.1:8000"
echo "🖥️  Frontend:   http://localhost:3000"
echo "📖 API Docs:    http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop both services."
echo "--------------------------------------------------------"

# Wait for background processes to keep script running
wait
