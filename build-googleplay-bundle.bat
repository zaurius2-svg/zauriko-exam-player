@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo       СБОРКА РЕЛИЗНОГО ПАКЕТА GOOGLE PLAY (.AAB)
echo ========================================================
echo.

set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

set "ANDROID_HOME=C:\Users\Progr\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

cd /d "%~dp0"

echo [1/3] Компиляция веб-бандла...
cd frontend
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка при сборке фронтенда!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Синхронизация Capacitor Android...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка синхронизации Capacitor!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Компиляция подписанного Android App Bundle (.aab)...
cd android
call gradlew.bat bundleRelease
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Ошибка сборки Gradle!
    pause
    exit /b %ERRORLEVEL%
)

cd ..\..

echo.
echo ========================================================
echo   РЕЛИЗНЫЙ ПАКЕТ УСПЕШНО СОБРАН!
echo   Файл для загрузки в Google Play:
echo   frontend\android\app\build\outputs\bundle\release\app-release.aab
echo ========================================================
echo.

explorer "frontend\android\app\build\outputs\bundle\release"

pause