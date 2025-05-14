#!/usr/bin bash

'./onionscan' --verbose -webport=8080 --torProxyAddress=$TOR_PROXY $HOSTNAME
