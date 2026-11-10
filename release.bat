@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo       СБОРКА АВТОНОМНОГО РЕЛИЗА ZAURIKO EXAM SIMULATOR
echo ========================================================
echo.

cd /d "%~dp0"

:: 0. Принудительное закрытие предыдущего экземпляра
taskkill /f /im exam-player.exe >nul 2>&1

:: 1. Проверка и обновление Go зависимостей
echo [1/4] Проверка модулей Go...
go mod tidy
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Не удалось выполнить go mod tidy!
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Компиляция фронтенда
echo.
echo [2/4] Сборка фронтенда (Vite / npm run build)...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка при сборке фронтенда!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..

:: 3. Компиляция единого бинарника Wails
echo.
echo [3/4] Компиляция исполняемого файла exam-player.exe...
call wails build -clean -s -windowsconsole=false
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка при сборке wails build!
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Формирование финальной папки раздачи
echo.
echo [4/4] Подготовка релизной папки...
if not exist "Release" mkdir "Release"
copy /y "build\bin\exam-player.exe" "Release\exam-player.exe" >nul

echo.
echo ========================================================
echo   СБОРКА УСПЕШНО ЗАВЕРШЕНА!
echo   Файл готов: Release\exam-player.exe
echo ========================================================
echo.

explorer "Release"
pause