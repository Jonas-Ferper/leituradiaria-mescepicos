#! /usr/bin/env bash
# - Gera os ícones da PWA e a logo da cabeceira a partir de logosite.png (raiz).
# - any / apple / favicon / marca: logótipo em corpo inteiro (resize direto).
# - maskable: fundo #0e1120 opaco + logótipo a ~66% (zona segura de corte).
# - `-strip` em TODAS as saídas: remove metadados e torna o PNG determinístico
#   (regenerar com a mesma fonte produz bytes idênticos -> sem ruído no git).
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
  magick "$SOURCE" -resize "${size}x${size}" -background none -strip "$ICONS/icon-${size}.png"
  # maskable (fundo opaco + logo ~66%)
  tam=$((size * 66 / 100))
  magick "$SOURCE" -resize "${tam}x${tam}" -background none -strip "$ICONS/.mask-${size}.png"
  magick -size "${size}x${size}" xc:"$FUNDO" -strip "$ICONS/.fundo-${size}.png"
  magick "$ICONS/.fundo-${size}.png" "$ICONS/.mask-${size}.png" -gravity center -composite -strip "$ICONS/icon-maskable-${size}.png"
  rm -f "$ICONS/.mask-${size}.png" "$ICONS/.fundo-${size}.png"
  echo "[icones] icon-${size}.png + icon-maskable-${size}.png"
done

magick "$SOURCE" -resize 180x180 -background none -strip "$ICONS/apple-touch-icon.png"
echo "[icones] apple-touch-icon.png (180 px)"

magick "$SOURCE" -resize 64x64 -background none -strip "$ICONS/favicon-64.png"
echo "[icones] favicon-64.png"

magick "$SOURCE" -resize 128x128 -background none -strip "$ICONS/icon-marca.png"
echo "[icones] icon-marca.png (logo da cabeceira, 128 px)"