@echo off

echo ------------
@REM package name
@REM ------------

@REM This separate file exists to prevent the whole script from terminating
@REM when license-report or a dependency calls process.exit(0)
npx license-report --output=table %*
