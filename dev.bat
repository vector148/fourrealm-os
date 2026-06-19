@echo off
title FourRealm OS v3
cd /d "%~dp0"
set PORT=3001
set CLIENT_ORIGIN=http://localhost:5173
set VITE_PORT=5173
set VITE_API_TARGET=http://localhost:3001
npm run dev
