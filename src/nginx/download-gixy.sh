#!/bin/sh

# https://github.com/dvershinin/gixy/releases
# Renovate bumps the version; copy both checksums from that release's checksums.txt
DEFAULT_VERSION='v0.2.57'
DEFAULT_LINUX_AARCH64_CHECKSUM='dff01009947b1104121b51e6f58b702a3838d9fade09a148ea12e3d006006282'
DEFAULT_LINUX_X86_64_CHECKSUM='bafd03e0695c9532af27b6ba2816f0d230bbab878f73562060a5652b334f515b'

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
