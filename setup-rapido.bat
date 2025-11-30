@echo off
setlocal enabledelayedexpansion

echo.
echo ================================
echo (1) Iniciando Apache (XAMPP)...
echo ================================

start "" "C:\xampp\apache_start.bat"

REM Aguarda alguns segundos para garantir que o Apache inicie
timeout /t 3 >nul
echo. 
echo [OK] Apache iniciado. LEMBRETE: Deixe a janela do terminal aberta enquanto roda o projeto. 

REM Caminho do projeto
SET "PROJETO_PATH=%~dp0"
cd /d "%PROJETO_PATH%"

echo.
echo ================================
echo (2) Instalando pacotes do projeto (NPM)...
echo ================================

call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao instalar pacotes NPM.
    goto :erro
) ELSE (
    echo.
    echo [OK] Pacotes NPM instalados.
)

echo.
echo ================================
echo (3) Iniciando o servidor do NPM...
echo ================================

call npm start

exit /b

:erro
echo.
echo ================================
echo HOUVE UM ERRO. ENCERRANDO SETUP...
echo ================================
pause
exit /b