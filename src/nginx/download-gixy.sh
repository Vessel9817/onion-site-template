#!/bin/sh

# https://github.com/dvershinin/gixy/releases
# Renovate bumps the version; copy both checksums from that release's checksums.txt
DEFAULT_VERSION='v0.2.61'
DEFAULT_LINUX_AARCH64_CHECKSUM='c562e6986764673d22e1355768c08702efecb4bc440d48c4773d4eb453115e5d'
DEFAULT_LINUX_X86_64_CHECKSUM='a114b616da59d94249e6de6d0b1bbcf5bd1e6f4e34208f2e2106eccd2898a8bb'

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
