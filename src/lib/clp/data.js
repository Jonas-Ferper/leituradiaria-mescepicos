import { validarMes, diaKey } from './validar.js'
import { fonte } from './fetcher.js'

export class ClpErro extends Error {
  constructor(codigo, mensagem) {
    super(mensagem)
    this.codigo = codigo
  }
}

const ouvintes = new Set()
const cacheMeses = new Map() // 'ano-mes' -> { fase, meta, data, erro }

let indicePromise = null
let indice = null

function notificar() {
  for (const fn of ouvintes) fn()
}

function keyMes(ano, mes) {
  return `${ano}-${String(mes).padStart(2, '0')}`
}

export function ouvirIndice(fn) {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

function validarIndice(dado) {
  if (!dado || typeof dado !== 'object' || !Array.isArray(dado.meses)) {
    throw new ClpErro('INDICE_INVALIDO', 'O índice de dados não tem a forma esperada.')
  }
  return dado
}

export async function descobrirIndice() {
  if (indice) return indice
  if (!indicePromise) {
    indicePromise = fonte
      .indice()
      .then(validarIndice)
      .then((d) => {
        indice = d
        notificar()
        return d
      })
      .catch((err) => {
        indicePromise = null
        throw err
      })
  }
  return indicePromise
}

export function temIndice() {
  return !!indice
}

export function obterIndice() {
  if (!indice) throw new ClpErro('SEM_INDICE', 'O índice de dados ainda não foi carregado.')
  return indice
}

export function metaMes(ano, mes) {
  if (!indice) return null
  const chave = keyMes(ano, mes)
  return indice.meses.find((m) => m.mesChave === chave) || null
}

export function anosDisponiveis() {
  if (!indice) return []
  return [...new Set(indice.meses.map((m) => m.ano))].sort((a, b) => a - b)
}

export function mesesDoAno(ano, { todos = true } = {}) {
  if (!indice) return []
  const lista = indice.meses.filter((m) => m.ano === ano)
  return todos ? lista : lista.filter((m) => m.valido)
}

export function statusMes(ano, mes) {
  const meta = metaMes(ano, mes)
  if (!meta) return 'ausente'
  return meta.valido ? 'disponivel' : 'indisponivel'
}

function cumprirPedido(chave, ano, mes) {
  return fonte.mes(ano, mes).then((dados) => {
    const { ok, erros } = validarMes(dados)
    if (!ok) {
      throw new ClpErro('MES_INVALIDO', `O ficheiro do mês tem erros: ${erros.join(' | ')}`)
    }
    cacheMeses.set(chave, { fase: 'pronto', meta: metaMes(ano, mes), data: dados })
    notificar()
  })
}

function quemErra(chave, err) {
  cacheMeses.set(chave, { fase: 'erro', erro: err })
  notificar()
}

export async function carregarMes(ano, mes) {
  await descobrirIndice()
  const chave = keyMes(ano, mes)
  const emCache = cacheMeses.get(chave)
  if (emCache && emCache.fase === 'pronto') return { chave, ...emCache }
  if (emCache && emCache.fase === 'erro') throw emCache.erro

  const estado = statusMes(ano, mes)
  if (estado === 'ausente') {
    const err = new ClpErro('MES_AUSENTE', 'Os dados deste mês ainda não foram disponibilizados.')
    quemErra(chave, err)
    throw err
  }
  if (estado === 'indisponivel') {
    const err = new ClpErro('MES_INDISPONIVEL', 'O mês está marcado como indisponível por conter erros.')
    quemErra(chave, err)
    throw err
  }

  if (!emCache) cacheMeses.set(chave, { fase: 'carregando' })
  try {
    await cumprirPedido(chave, ano, mes)
  } catch (err) {
    quemErra(chave, err)
    throw err
  }
  return { chave, ...cacheMeses.get(chave) }
}

export function cacheDoMes(chave) {
  return cacheMeses.get(chave) || null
}

export async function diaDe(ano, mes, dia) {
  const res = await carregarMes(ano, mes)
  if (!res.data) return null
  const chaveAlvo = diaKey(ano, mes, dia)
  return res.data.dias.find((d) => d.dataCivil === chaveAlvo) || null
}

function proximoValido(atual, direcao) {
  if (!indice) return null
  const cadeia = indice.meses.filter((m) => m.valido).sort((a, b) => a.mesChave.localeCompare(b.mesChave))
  const i = cadeia.findIndex((m) => m.mesChave === atual)
  if (i < 0) return null
  return cadeia[i + direcao] || null
}

export function navegacaoDe(ano, mes) {
  const chave = keyMes(ano, mes)
  return {
    anterior: proximoValido(chave, -1),
    seguinte: proximoValido(chave, 1),
  }
}