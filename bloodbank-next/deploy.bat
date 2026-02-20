@echo off
echo ==========================================
echo   Blood Bank Management System - Deploy
echo ==========================================

echo [1/5] Installing Dependencies...
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

echo [2/5] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 exit /b %errorlevel%

echo [3/5] Pushing Database Schema...
call npx prisma db push
if %errorlevel% neq 0 exit /b %errorlevel%

echo [4/5] Building Application...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo [5/5] Starting Application...
echo The application will start at http://localhost:3000
call npm start
