@echo off
setlocal

set helper="%~dp0/helper.cmd"

call %helper% --config=./config/license-report/configs/website.config.json
call %helper% --config=./config/license-report/configs/backend.config.json
call %helper% --config=./config/license-report/configs/express.config.json
call %helper% --config=./config/license-report/configs/mongo.config.json

endlocal
