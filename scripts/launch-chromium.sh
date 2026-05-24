#!/bin/bash
# Launch Chromium with NVIDIA GPU and WebGL flags
# Prevents Chrome from picking the AMD fallback GPU on dual-GPU systems

exec chromium-browser \
  --use-angle=gl \
  --use-gl=angle \
  --ignore-gpu-blocklist \
  --enable-webgl \
  --enable-accelerated-2d-canvas \
  --disable-gpu-sandbox \
  "$@"
