#!/bin/bash
# Launch Brave with NVIDIA GPU and WebGL flags
# Prevents Brave from picking the AMD fallback GPU on dual-GPU systems
exec brave-browser \
  --use-angle=gl \
  --use-gl=angle \
  --ignore-gpu-blocklist \
  --enable-webgl \
  --enable-accelerated-2d-canvas \
  --disable-gpu-sandbox \
  "$@"
