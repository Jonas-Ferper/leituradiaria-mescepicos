import { pad2 } from './validar.js'
import { metaMes, navegacaoDe } from './data.js'
import { nomeDoMesCap } from './formatar.js'

function diaChave(ano, mes, dia) {
  return `${ano}-${pad2(mes)}-${pad2(dia)}`
}

function rotulo(dia, mes) {
  const [, m, d] = String(dia.dataCivil).split('-').map(Number)
  return `${d} ${nomeDoMesCap(m).slice(0, 3)} · ${dia.celebracaoPrincipal?.nome || ''}`
}

function alvo(metaMesAlvo, numero, texto) {
  return { ano: metaMesAlvo.ano, mes: metaMesAlvo.mes, numero, texto }
}

export function diaAnterior(ano, mes, dia, dias) {
  const i = dias.findIndex((d) => d.dataCivil === diaChave(ano, mes, dia))
  if (i > 0) {
    const d = dias[i - 1]
    return { ano, mes, numero: Number(String(d.dataCivil).slice(-2)), texto: rotulo(d, mes) }
  }
  const anterior = navegacaoDe(ano, mes).anterior
  if (!anterior) return null
  const meta = metaMes(anterior.ano, anterior.mes)
  if (!meta) return null
  return alvo(meta, meta.totalDias, `último dia de ${meta.nomeMes}`)
}

export function diaSeguinte(ano, mes, dia, dias) {
  const i = dias.findIndex((d) => d.dataCivil === diaChave(ano, mes, dia))
  if (i >= 0 && i < dias.length - 1) {
    const d = dias[i + 1]
    return { ano, mes, numero: Number(String(d.dataCivil).slice(-2)), texto: rotulo(d, mes) }
  }
  const seguinte = navegacaoDe(ano, mes).seguinte
  if (!seguinte) return null
  const meta = metaMes(seguinte.ano, seguinte.mes)
  if (!meta) return null
  return alvo(meta, 1, `1 de ${meta.nomeMes}`)
}