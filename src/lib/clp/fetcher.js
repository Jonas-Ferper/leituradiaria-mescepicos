import { pad2 } from './validar.js'

const BASE = import.meta.env?.BASE_URL || '/'

async function obterJSON(url) {
  const resposta = await fetch(url, { cache: 'no-cache' })
  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status} ao ler ${url}`)
  }
  return resposta.json()
}

export const fonte = {
  tipo: 'ficheiros-estaticos',
  origem: `${BASE}data/index.json`,
  async indice() {
    return obterJSON(`${BASE}data/index.json`)
  },
  async mes(ano, mes) {
    return obterJSON(`${BASE}data/clp-${ano}-${pad2(mes)}.json`)
  },
}