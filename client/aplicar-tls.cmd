@echo off
echo Aplicando configuracion TLS 1.2 para Windows 7...
regedit.exe /s "%~dp0habilitarTLS-W7.reg"
if %ERRORLEVEL% EQU 0 (
    echo Configuracion TLS aplicada correctamente.
) else (
    echo Advertencia: No se pudo aplicar la configuracion TLS.
)
pause
