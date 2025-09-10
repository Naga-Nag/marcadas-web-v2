@echo off
echo Construyendo cliente Tauri con configuracion TLS...
echo.

REM Verificar que los archivos necesarios existen
if not exist "habilitarTLS-W7.reg" (
    echo ERROR: No se encuentra el archivo habilitarTLS-W7.reg
    echo Asegurese de que el archivo este en el directorio client/
    pause
    exit /b 1
)

if not exist "aplicar-tls.cmd" (
    echo ERROR: No se encuentra el archivo aplicar-tls.cmd
    echo Asegurese de que el archivo este en el directorio client/
    pause
    exit /b 1
)

echo Archivos TLS encontrados, procediendo con la construccion...
echo.

REM Cambiar al directorio src-tauri
cd src-tauri

REM Limpiar construcciones anteriores
echo Limpiando construcciones anteriores...


REM Construir la aplicacion
echo Construyendo aplicacion...
cargo tauri build

echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================
    echo CONSTRUCCION COMPLETADA EXITOSAMENTE
    echo ======================================================
    echo.
    echo El instalador esta ubicado en:
    echo target\release\bundle\nsis\GuardiasWeb_0.1.0_x64-setup.exe
    echo.
    echo ARCHIVOS TLS INCLUIDOS:
    echo - habilitarTLS-W7.reg: Configuracion de registro TLS
    echo - aplicar-tls.cmd: Script para aplicar configuracion
    echo.
    echo INSTRUCCIONES POST-INSTALACION:
    echo Despues de instalar, ejecutar como administrador:
    echo aplicar-tls.cmd ^(ubicado en el directorio de instalacion^)
    echo.
) else (
    echo Error en la construccion. Codigo de salida: %ERRORLEVEL%
)
echo.
pause