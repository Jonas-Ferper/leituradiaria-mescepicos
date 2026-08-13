import { CORES_LITURGICAS, DIA_SEMANA } from './validar.js'

export const COR_HEX = {
  Branco: '#e6d9b0',
  Vermelho: '#d05a49',
  Verde: '#57a678',
  Roxo: '#a585d9',
  Rosa: '#e39b9b',
  Preto: '#46464f',
  Dourado: '#e0bd72',
}

export function corLegivel(cor) {
  return COR_HEX[cor] || '#e0bd72'
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const SEMANAS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
]

export function diaDaSemana(nome) {
  if (!nome) return ''
  const chave = String(nome).toLowerCase()
  if (chave in DIA_SEMANA) return SEMANAS[DIA_SEMANA[chave]]
  return nome.trim()
}

export function indexDiaSemana(nome) {
  const chave = String(nome || '').toLowerCase()
  return DIA_SEMANA[chave] ?? -1
}

export function nomeDoMes(mes) {
  return MESES[mes - 1] || ''
}

export function capitalizar(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const MESES_CAP = MESES.map(capitalizar)

export function nomeDoMesCap(mes) {
  return MESES_CAP[mes - 1] || ''
}

export function dataPorExtenso(dataCivil) {
  if (!dataCivil) return ''
  const [ano, mes, dia] = String(dataCivil).split('-').map(Number)
  if (!ano || !mes || !dia) return ''
  return `${dia} de ${nomeDoMes(mes)} de ${ano}`
}

export function dataCurta(dataCivil) {
  if (!dataCivil) return ''
  const [, mes, dia] = String(dataCivil).split('-').map(Number)
  return `${dia} ${nomeDoMesCap(mes).slice(0, 3)}`
}

export function hojeCivil() {
  const agora = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`
}

export function ehHoje(dataCivil) {
  return dataCivil === hojeCivil()
}

export function corDoTempo(tempo) {
  const t = String(tempo || '').toLowerCase()
  if (t.includes('comum')) return 'Verde'
  if (t.includes('advento')) return 'Roxo'
  if (t.includes('quaresma')) return 'Roxo'
  if (t.includes('pascal') || t.includes('páscoa') || t.includes('pascoa')) return 'Branco'
  if (t.includes('natal')) return 'Branco'
  const codigo = String(tempo || '').toUpperCase()
  if (codigo === 'TC') return 'Verde'
  if (codigo === 'TQ' || codigo === 'AD') return 'Roxo'
  if (codigo === 'TP' || codigo === 'NA') return 'Branco'
  return 'Verde'
}

export function normalizarTexto(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}