#!/bin/sh

# https://github.com/dvershinin/gixy/releases
# Renovate bumps the version; copy both checksums from that release's checksums.txt
DEFAULT_VERSION='v0.2.60'
DEFAULT_LINUX_AARCH64_CHECKSUM='1bc0732eb9f30a8ce17b1e829c03e84eb746a25011b2069a51cd206c80f40f05'
DEFAULT_LINUX_X86_64_CHECKSUM='f0afbd46edb540efa8773beaee377ffef4e90c5b1f40cb7021722aba07e4ee41'

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

if ! echo "${GIXY_CHECKSUM} /project/gixy" | sha256sum -c - > /dev/null; then
    echo '[ERR] Computed SHA256 checksum didn'"'"'t match GIXY_CHECKSUM' >&2
    exit 1
fi

chmod +x '/project/gixy'
