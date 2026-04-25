@echo off
cd /d "%~dp0"
title Local Market Server
color 0A
echo ========================================
echo    LOCAL MARKET - Servidor Iniciando
echo ========================================
echo.
node server.js
pause
