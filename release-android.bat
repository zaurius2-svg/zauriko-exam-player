@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo       СБОРКА МОБИЛЬНОГО ПРИЛОЖЕНИЯ ANDROID (APK)
echo ========================================================
echo.

:: 1. Привязка официальной Microsoft JDK 21
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: 2. Пути к Android SDK
set "ANDROID_HOME=C:\Users\Progr\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0"

:: 3. Остановка фоновых процессов Gradle
cd frontend\android
call gradlew.bat --stop >nul 2>&1
cd ..\..

:: 4. Сборка фронтенда
echo [1/3] Компиляция веб-бандла...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка при выполнении npm run build!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)

:: 5. Синхронизация файлов с Capacitor
echo.
echo [2/3] Синхронизация с платформой Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка при синхронизации Capacitor!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)

:: 6. Компиляция готового APK через Gradle
echo.
echo [3/3] Компиляция APK-файла через Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка сборки Gradle!
    cd ..\..
    pause
    exit /b %ERRORLEVEL%
)

cd ..\..

echo.
echo ========================================================
echo   СБОРКА УСПЕШНО ЗАВЕРШЕНА!
echo   APK готов к установке на смартфон.
echo ========================================================
echo.

explorer "frontend\android\app\build\outputs\apk\debug"

pause