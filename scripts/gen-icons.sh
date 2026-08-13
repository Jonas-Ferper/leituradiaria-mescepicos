#!/usr/bin/env bash
# Gera os ícones da PWA a partir de public/icons/icon.svg (one-shot).
# Usa rsvg-convert quando disponível; senão cai para ImageMagick.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ICONS="$RAIZ/public/icons"
mkdir -p "$ICONS"

SPECS=(
  "192 icon-192"
  "512 icon-512"
  "192 icon-maskable-192"
  "512 icon-maskable-512"
  "180 apple-touch-icon"
)

if command -v rsvg-convert >/dev/null 2>&1; then
  for spec in "${SPECS[@]}"; do
    size="${spec%% *}"
    out="${spec##* }"
    rsvg-convert -w "$size" -h "$size" "$ICONS/icon.svg" -o "$ICONS/$out.png"
    echo "[icones] $out.png ($size px)"
  done
elif command -v magick >/dev/null 2>&1; then
  for spec in "${SPECS[@]}"; do
    size="${spec%% *}"
    out="${spec##* }"
    magick -background none "$ICONS/icon.svg" -resize "${size}x${size}" "$ICONS/$out.png"
    echo "[icones] $out.png ($size px, imagemagick)"
  done
else
  echo "[icones] rsvg-convert e imagemagick ausentes; não foi possível gerar PNGs." >&2
  exit 1
fi
