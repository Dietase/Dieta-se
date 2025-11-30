@echo off
setlocal enabledelayedexpansion

echo.
echo ================================
echo (1) Iniciando Apache e MySQL (XAMPP)...
echo ================================

start "" "C:\xampp\apache_start.bat"
start "" "C:\xampp\mysql_start.bat"

REM Aguarda alguns segundos para garantir que os serviços iniciem
timeout /t 5 >nul
echo. 
echo [OK] Processos iniciados. LEMBRETE: Deixe as janelas do terminal abertas enquanto roda o projeto. 

echo.
echo ================================
echo (2) Executando script SQL no MySQL...
echo ================================

REM Caminho do projeto
SET "PROJETO_PATH=%~dp0"
SET "SQL_PATH=%PROJETO_PATH%SQL\SQL.sql"

cd /d "C:\xampp\mysql\bin"
mysql -u root < "%SQL_PATH%"
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao executar o script SQL.
    goto :erro
) ELSE (
    echo.
    echo [OK] Script SQL executado com sucesso.
)

echo.
echo ================================
echo (2.1) Importando dados da TACO...
echo ================================

php "%PROJETO_PATH%SQL\import.php"
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao importar os dados da TACO.
    goto :erro
) ELSE (
    echo.
    echo [OK] Dados importados com sucesso.
)

cd /d "%PROJETO_PATH%"

echo.
echo ================================
echo (3) Instalando pacotes do projeto (NPM)...
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
echo SETUP FINALIZADO COM SUCESSO!
echo ================================

echo.
echo ================================
echo (4) Iniciando o servidor do NPM...
echo ================================

call npm start
goto :fim

:erro
echo.
echo ================================
echo HOUVE UM ERRO. ENCERRANDO SETUP...
echo ================================
pause
exit /b

:fim
exit /b