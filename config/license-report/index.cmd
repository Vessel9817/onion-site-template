@echo off
setlocal

set helper="%~dp0/helper.cmd"

@REM Field "label" is a placeholder, as it should never be in a package.json
@REM https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/package.json
call %helper% --config=./config/license-report/configs/website.config.json
call %helper% --config=./config/license-report/configs/backend.config.json
call %helper% --config=./config/license-report/configs/express.config.json
call %helper% --config=./config/license-report/configs/kafka.config.json
call %helper% --config=./config/license-report/configs/mongo.config.json

endlocal
