@echo off
setlocal EnableDelayedExpansion

REM Validating command usage
if NOT "%1 " == " " (
    if "%2 " == " " (
        REM Running onionscan
        set top=%~dp0..
        set /p hostname=<"!top!/config/tor/secrets/hostname"
        set onionscan="%GOPATH%/bin/onionscan"
        set outDir=!top!/onionscan
        set db="!outDir!/db"
        set results="!outDir!/results.txt"

        mkdir "!outDir!"

        !onionscan! -verbose -dbdir !db! -webport %1 !hostname! > !results!

        REM Cleaning up
        rmdir /S !outDir!

        REM Terminating successfully
        endlocal
        exit /b 0
    )
)

REM Terminating with error
endlocal
echo "Usage: onionscan <PORT>"
exit /b 1
