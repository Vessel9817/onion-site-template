#!/bin/sh

# https://github.com/dvershinin/gixy/releases
DEFAULT_VERSION='v0.2.53'
DEFAULT_DARWIN_ARM64_CHECKSUM='438265b97f6336397195eb1222e291c79056d45b67d8caeb9b7387c5bdf430cb'
DEFAULT_LINUX_AARCH64_CHECKSUM='0e4bdf4ee0f22322870fc8ea2d3cfe2654857ae51af9c75b077907ef68181125'
DEFAULT_LINUX_X86_64_CHECKSUM='2a97d94d5a6cc4e0924de13b5a4024328d3d074e79be01277ffddf77350b16c5'

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

# Installing Gixy
wget "$GIXY_URL" -qO '/project/gixy' || echo "[ERR] Failed to download Gixy from: ${GIXY_URL}" >&2

if ! echo "${GIXY_CHECKSUM} /project/gixy" | sha256sum --strict -c - > /dev/null; then
    echo '[ERR] Computed SHA256 checksum didn'"'"'t match GIXY_CHECKSUM' >&2
    exit 1
fi

chmod +x '/project/gixy'
