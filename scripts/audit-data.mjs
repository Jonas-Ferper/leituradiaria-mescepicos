import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validarMes } from '../src/lib/clp/validar.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(__dirname, '..')

const PADRAO = /^clp-(\d{4})-(\d{1,2})\.json$/
const SEMANAS_PT = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
const LEITURAS_BASE = ['primeiraLeitura', 'salmoResponsorial', 'aclamacaoEvangelho', 'evangelho']
const CAMPOS_UI = [
  'dataCivil', 'diaSemanaCivil', 'anoLiturgico', 'cicloDominical', 'cicloFerial',
  'tempoLiturgico', 'tempoLiturgicoNome', 'semanaLiturgica', 'categoriaLiturgica',
  'corLiturgica', 'chaveCanonica',
]
const CAMPOS_CELEBRACAO = ['nome', 'categoria', 'categoriaNome', 'cor', 'chaveCanonica']

let avisos = 0
const avisar = (...args) => {
  console.warn('[aviso]', ...args)
  avisos++
}

function diaSemanaDe(dataCivil) {
  const [a, m, d] = dataCivil.split('-').map(Number)
  return SEMANAS_PT[new Date(a, m - 1, d).getDay()]
}

function auditardia(dia) {
  const faltamBase = LEITURAS_BASE.filter((k) => {
    const lt = dia.Leituras?.[k]
    return !lt || !lt.texto
  })
  if (faltamBase.length) avisar(`${dia.dataCivil}: falta(m) leitura(s) base: ${faltamBase.join(', ')}`)

  for (const campo of CAMPOS_UI) {
    if (dia[campo] === undefined || dia[campo] === null || dia[campo] === '') {
      avisar(`${dia.dataCivil}: campo UI "celular ${campo}” em falta`)
    }
  }

  const ce = dia.celebracaoPrincipal || {}
  for (const campo of CAMPOS_CELEBRACAO) {
    if (!ce[campo]) avisar(`${dia.dataCivil}: celebracaoPrincipal["${campo}"] em falta`)
  }

  const domingo = dia.diaSemanaCivil?.toLowerCase() === 'domingo'
  const solenidade = dia.categoriaLiturgica === 'SOL'
  const temSegunda = dia.Leituras?.segundaLeitura?.texto
  if ((domingo || solenidade) && !temSegunda) {
    avisar(`${dia.dataCivil}: ${solenidade ? 'solenidade' : 'domingo'} sem segunda leitura`)
  }
  if (temSegunda && !domingo && !solenidade) {
    avisar(`${dia.dataCivil}: tem segunda leitura fora de domingo/solenidade (confirmar intenção)`)
  }
}

let totalMeses = 0
let totalDias = 0
const problemasPorMes = []

for (const nome of readdirSync(RAIZ)) {
  const m = nome.match(PADRAO)
  if (!m) continue
  totalMeses++
  const chave = `${m[1]}-${m[2]}`

  let dados
  try {
    dados = JSON.parse(readFileSync(path.join(RAIZ, nome), 'utf8'))
  } catch {
    console.warn(`[ERRO] ${nome}: JSON ilegível`)
    problemasPorMes.push(chave)
    continue
  }

  const { ok, erros } = validarMes(dados)
  if (!ok) {
    console.warn(`[ERRO] ${nome}: validação falhou -> ${erros.join(' | ')}`)
    problemasPorMes.push(chave)
    continue
  }

  const dias = dados.dias
  totalDias += dias.length

  let dataEsperada = null
  for (const dia of dias) {
    if (dataEsperada && dia.dataCivil !== dataEsperada) {
      avisar(`${nome}: sequência quebra — esperava ${dataEsperada}, veio ${dia.dataCivil}`)
    }
    const real = diaSemanaDe(dia.dataCivil)
    if (dia.diaSemanaCivil?.toLowerCase() !== real) {
      avisar(`${nome} ${dia.dataCivil}: diaSemanaCivil '${dia.diaSemanaCivil}' ≠ real '${real}'`)
    }
    auditardia(dia)
    dataEsperada = dia.dataCivil && somaDia(dia.dataCivil)
  }

  const segundas = dias.filter((d) => d.Leituras?.segundaLeitura?.texto).length
  const comLeituras = dias.filter((d) => d.Leituras).length
  console.log(`[mes] ${nome}: ${dias.length} dias | ${comLeituras} com leituras | segunda leitura em ${segundas}`)
}

function somaDia(dataCivil) {
  const [a, m, d] = dataCivil.split('-').map(Number)
  const dt = new Date(a, m - 1, d + 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

console.log('---')
console.log(`meses: ${totalMeses} | dias: ${totalDias} | meses com problema: ${problemasPorMes.length}`)
if (problemasPorMes.length) console.log('com problema:', problemasPorMes.join(', '))
console.log(`avisos: ${avisos}`)
process.exit(problemasPorMes.length ? 1 : 0)