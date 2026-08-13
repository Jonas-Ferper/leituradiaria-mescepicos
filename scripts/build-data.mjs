import { readFileSync, readdirSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validarMes } from '../src/lib/clp/validar.js'

const ROOT = process.cwd()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DATA = path.join(ROOT, 'public', 'data')
const PADRAO = /^clp-(\d{4})-(\d{1,2})\.json$/

function log(...args) {
  console.log('[data]', ...args)
}

function warn(...args) {
  console.warn('[data:erro]', ...args)
}

function descobrirFicheiros() {
  const vistos = new Map()
  for (const nome of readdirSync(ROOT)) {
    const m = nome.match(PADRAO)
    if (!m) continue
    const ano = Number(m[1])
    const mes = Number(m[2])
    if (mes < 1 || mes > 12) {
      warn(`${nome}: mês fora de 1–12, ignorado`)
      continue
    }
    const chave = `${ano}-${String(mes).padStart(2, '0')}`
    if (vistos.has(chave)) warn(`mês duplicado para ${chave}: ${nome} (fica ${vistos.get(chave)})`)
    else vistos.set(chave, nome)
  }
  return [...vistos.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

function dominantes(dias) {
  const tempo = new Map()
  const cor = new Map()
  const semana = new Map()
  const categoria = new Map()
  let comLeituras = 0

  for (const dia of dias) {
    const t = String(dia.tempoLiturgicoNome || dia.tempoLiturgico || '').trim()
    if (t) tempo.set(t, (tempo.get(t) || 0) + 1)

    const c = String(dia.corLiturgica || '').trim()
    if (c) cor.set(c, (cor.get(c) || 0) + 1)

    if (dia.diaSemanaCivil) {
      semana.set(String(dia.diaSemanaCivil).trim(), (semana.get(String(dia.diaSemanaCivil).trim()) || 0) + 1)
    }

    const cat = dia.categoriaLiturgica || dia.celebracaoPrincipal?.categoria
    if (cat) categoria.set(String(cat).trim(), (categoria.get(String(cat).trim()) || 0) + 1)

    if (dia.Leituras) comLeituras++
  }

  const topo = (mapa) => [...mapa.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''

  return {
    tempo: topo(tempo),
    cor: topo(cor),
    categoria: topo(categoria),
    domingosNoMes: [...semana.entries()].filter(([k]) => k.toLowerCase().startsWith('dom')).reduce((s, [, n]) => s + n, 0),
    comLeituras,
  }
}

function lerEMeta(chave, nome) {
  const caminhoFonte = path.join(ROOT, nome)
  const meta = {
    mesChave: chave,
    ano: Number(chave.split('-')[0]),
    mes: Number(chave.split('-')[1]),
    nomeMes: '',
    arquivo: nome,
    valido: false,
    versao: '',
    inicio: '',
    fim: '',
    totalDias: 0,
    comLeituras: 0,
    tempo: '',
    cor: '',
    categoria: '',
    erro: '',
  }

  let bruto
  try {
    bruto = readFileSync(caminhoFonte, 'utf8')
  } catch (err) {
    meta.erro = `leitura falhou: ${err.message}`
    warn(`${nome}: ${meta.erro}`)
    return meta
  }

  let dados
  try {
    dados = JSON.parse(bruto)
  } catch (err) {
    meta.erro = `JSON inválido: ${err.message}`
    warn(`${nome}: ${meta.erro}`)
    return meta
  }

  const { ok, erros } = validarMes(dados)
  if (!ok) {
    meta.erro = `validação falhou: ${erros.join(' | ')}`
    warn(`${nome}: ${meta.erro}`)
    return meta
  }

  const d = dominantes(dados.dias)
  meta.valido = true
  meta.versao = String(dados.versao ?? '')
  meta.nomeMes = String(dados.nomeMes ?? '')
  meta.inicio = String(dados.inicio ?? '')
  meta.fim = String(dados.fim ?? '')
  meta.totalDias = dados.totalDias
  meta.comLeituras = d.comLeituras
  meta.domingosNoMes = d.domingosNoMes
  meta.tempo = d.tempo
  meta.cor = d.cor
  meta.categoria = d.categoria
  return meta
}

const ficheiros = descobrirFicheiros()
log(`encontrados ${ficheiros.length} ficheiros clp-YYYY-MM.json`)

mkdirSync(PUBLIC_DATA, { recursive: true })

const meses = []
let invalidos = 0

for (const [chave, nome] of ficheiros) {
  const meta = lerEMeta(chave, nome)
  meses.push(meta)
  if (!meta.valido) invalidos++
  const destino = path.join(PUBLIC_DATA, nome)
  try {
    copyFileSync(path.join(ROOT, nome), destino)
  } catch (err) {
    meta.erro = `cópia falhou: ${err.message}`
    meta.valido = false
    invalidos++
    warn(`${nome}: ${meta.erro}`)
  }
}

const porAno = {}
for (const m of meses) {
  ;(porAno[m.ano] ||= []).push(m)
}

const primeiro = meses.find((m) => m.valido) || null
const ultimo = [...meses].reverse().find((m) => m.valido) || null

const indice = {
  geradoEm: new Date().toISOString(),
  versao: '1.0.0',
  fonte: 'clp-*.json na raiz do projeto',
  total: meses.length,
  validos: meses.filter((m) => m.valido).length,
  invalidos,
  primeiro,
  ultimo,
  anos: Object.keys(porAno).map(Number).sort((a, b) => a - b),
  meses,
}

writeFileSync(path.join(PUBLIC_DATA, 'index.json'), JSON.stringify(indice, null, 2))

log(`índice escrito em public/data/index.json`)
log(`  primeiro: ${primeiro ? `${primeiro.nomeMes}/${primeiro.ano}` : '—'}`)
log(`  último:   ${ultimo ? `${ultimo.nomeMes}/${ultimo.ano}` : '—'}`)
log(`  válidos:  ${indice.validos} · inválidos: ${invalidos}`)
if (invalidos > 0) warn(`${invalidos} mês(es) marcado(s) como indisponível(is) — a aplicação continuará com os restantes.`)