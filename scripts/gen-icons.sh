#!/usr/bin/env bash
# Gera os ícones da PWA a partir de logosite.png (raiz do projeto).
# - any / apple / favicon: logótipo em corpo inteiro (resize direto).
# - maskable: fundo #0e1120 opaco + logótipo a ~66% (zona segura de corte).
# Requer ImageMagick (magick).
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ICONS="$RAIZ/public/icons"
SOURCE="$RAIZ/logosite.png"
FRACAO_MASKABLE=0.66
FUNDO="#0e1120"

if [ ! -f "$SOURCE" ]; then
  echo "[icones] logosite.png não encontrado na raiz." >&2
  exit 1
fi
command -v magick >/dev/null 2>&1 || {
  echo "[icones] ImageMagick (magick) ausente." >&2
  exit 1
}

mkdir -p "$ICONS"

for size in 192 512; do
  # any (corpo inteiro)
  magick "$SOURCE" -resize "${size}x${size}" -background none "$ICONS/icon-${size}.png"
  # maskable (fundo opaco + logo ~66%)
  tam=$((size * 66 / 100))
  magick "$SOURCE" -resize "${tam}x${tam}" -background none "$ICONS/.mask-${size}.png"
  magick -size "${size}x${size}" xc:"$FUNDO" "$ICONS/.fundo-${size}.png"
  magick "$ICONS/.fundo-${size}.png" "$ICONS/.mask-${size}.png" -gravity center -composite "$ICONS/icon-maskable-${size}.png"
  rm -f "$ICONS/.mask-${size}.png" "$ICONS/.fundo-${size}.png"
  echo "[icones] icon-${size}.png + icon-maskable-${size}.png"
done

magick "$SOURCE" -resize 180x180 -background none "$ICONS/apple-touch-icon.png"
echo "[icones] apple-touch-icon.png (180 px)"

magick "$SOURCE" -resize 64x64 -background none "$ICONS/favicon-64.png"
echo "[icones] favicon-64.png"