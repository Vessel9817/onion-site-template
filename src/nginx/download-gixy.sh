#!/bin/sh

# https://github.com/dvershinin/gixy/releases
# Renovate bumps the version; copy both checksums from that release's checksums.txt
DEFAULT_VERSION='v0.2.63'
DEFAULT_LINUX_AARCH64_CHECKSUM='5a2421ed2a2c3d996c1837481db3ffcaa148df1329b78f5377f4fef4d4b42923'
DEFAULT_LINUX_X86_64_CHECKSUM='2071bccb2149ab50987f271d6abf862541dc2445021f8c4d1678de0bf8a84569'

# Setting defaults
if [ -z "$GIXY_URL" ]; then
    if [ -z "$GIXY_VERSION" ] && [ -z "$GIXY_CHECKSUM" ]; then
        GIXY_VERSION="$DEFAULT_VERSION"
        os="$TARGETOS"
        arch="$TARGETARCH"

        if [ "$os" = "linux" ] && [ "$arch" = 'amd64' ]; then
            arch='x86_64'
            GIXY_CHECKSUM="$DEFAULT_LINUX_X86_64_CHECKSUM"
        elif [ "$os" = "linux" ] && [ "$arch" = 'arm64' ]; then
            arch='aarch64'
            GIXY_CHECKSUM="$DEFAULT_LINUX_AARCH64_CHECKSUM"
        else
            echo "[ERR] Unsupported platform: ${TARGETPLATFORM}. Please set GIXY_CHECKSUM and either GIXY_VERSION or GIXY_URL" >&2
            exit 1
        fi
    elif [ -z "$GIXY_VERSION" ] || [ -z "$GIXY_CHECKSUM" ]; then
        echo "[ERR] GIXY_VERSION and GIXY_CHECKSUM must be set together to infer GIXY_URL" >&2
        exit 1
    fi

    GIXY_URL="https://github.com/dvershinin/gixy/releases/download/${GIXY_VERSION}/gixy-${os}-${arch}"
elif [ -z "$GIXY_VERSION" ]; then
    echo "[WARN] GIXY_VERSION is ignored when GIXY_URL is set" >&2
fi

# Checksum verification defaults to enabled
if [ -z "$GIXY_VERIFY_CHECKSUM" ]; then
    GIXY_VERIFY_CHECKSUM='true'
fi

case "$GIXY_VERIFY_CHECKSUM" in
    1|true|yes|on)
        verify_checksum='true'
        ;;
    0|false|no|off)
        verify_checksum='false'
        echo '[WARN] Gixy checksum verification is disabled' >&2
        ;;
    *)
        echo '[ERR] GIXY_VERIFY_CHECKSUM must be set to true or false' >&2
        exit 1
        ;;
esac

# Installing Gixy
if ! wget "$GIXY_URL" -qO '/project/gixy'; then
    echo "[ERR] Failed to download Gixy from: ${GIXY_URL}" >&2
    exit 1
fi

if [ "$verify_checksum" = 'true' ]; then
    if ! echo "${GIXY_CHECKSUM} /project/gixy" | sha256sum -c - > /dev/null; then
        echo '[ERR] Computed SHA256 checksum didn'"'"'t match GIXY_CHECKSUM' >&2
        exit 1
    fi
fi

chmod +x '/project/gixy'
