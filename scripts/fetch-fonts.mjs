import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(__dirname, '..')
const PASTA = path.join(RAIZ, 'public', 'fonts')
const CSS_DESTINO = path.join(RAIZ, 'src', 'fonts.css')

const FAMILIAS =
  'family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900' +
  '&family=Instrument+Sans:ital,wght@0,400..700;1,400..700' +
  '&family=IBM+Plex+Mono:wght@400;500'
const URL = `https://fonts.googleapis.com/css2?${FAMILIAS}&display=swap`
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

mkdirSync(PASTA, { recursive: true })

async function obterCss() {
  const resposta = await fetch(URL, { headers: { 'user-agent': UA } })
  if (!resposta.ok) throw new Error(`Google Fonts respondeu HTTP ${resposta.status}`)
  return resposta.text()
}

function nomeArquivo(url) {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 10)
  return `clp-font-${hash}.woff2`
}

async function baixar(url, destino) {
  if (existsSync(destino) && statSync(destino).size > 0) return
  const resposta = await fetch(url, { headers: { 'user-agent': UA } })
  if (!resposta.ok) throw new Error(`download falhou (HTTP ${resposta.status}): ${url}`)
  writeFileSync(destino, Buffer.from(await resposta.arrayBuffer()))
}

const css = await obterCss()
const blocos = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1])

const face = (bloco) => ({
  familia: bloco.match(/font-family:\s*'([^']+)'/)?.[1] || '',
  estilo: bloco.match(/font-style:\s*(\w+)/)?.[1] || 'normal',
  peso: (bloco.match(/font-weight:\s*([^;]+)/)?.[1] || '').trim(),
  unicode: (bloco.match(/unicode-range:\s*([^;]+)/)?.[1] || '').trim(),
  url: bloco.match(/src:\s*url\(([^)]+)\)/)?.[1] || '',
})

const faces = blocos.map(face).filter((f) => f.url)
const linhas = []

for (const f of faces) {
  const destino = path.join(PASTA, nomeArquivo(f.url))
  await baixar(f.url, destino)
  const slug = f.familia.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const extensao = f.estilo === 'italic' ? 'italic' : 'normal'
  const arquivo = `${slug}-${extensao}.woff2`
  // renomeia para nome estável (mantém hash na apps side? usamos o hash direto)
  linhas.push(
    [
      `@font-face {`,
      `  font-family: '${f.familia}';`,
      `  font-style: ${f.estilo};`,
      `  font-weight: ${f.peso};`,
      `  font-display: swap;`,
      `  src: url('/fonts/${path.basename(destino)}') format('woff2');`,
      f.unicode ? `  unicode-range: ${f.unicode};` : '',
      `}`,
    ].join('\n'),
  )
  console.log(`[fontes] ${f.familia} ${f.estilo} ${f.peso} <- ${path.basename(destino)}`)
}

writeFileSync(CSS_DESTINO, linhas.join('\n\n') + '\n')
console.log(`[fontes] ${faces.length} faces escritas em src/fonts.css`)