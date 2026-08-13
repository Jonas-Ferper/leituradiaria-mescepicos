import { useCallback, useEffect, useReducer, useState } from 'react'
import { carregarMes, cacheDoMes, descobrirIndice, obterIndice, ouvirIndice, temIndice } from './data.js'
import { pad2 } from './validar.js'

export function useIndice() {
  const [, atualizar] = useReducer((x) => x + 1, 0)
  const [falhou, setFalhou] = useState(false)

  const iniciar = useCallback(() => {
    setFalhou(false)
    descobrirIndice().catch(() => setFalhou(true))
  }, [])

  useEffect(() => {
    iniciar()
    return ouvirIndice(atualizar)
  }, [iniciar])

  const pronto = temIndice()
  return pronto
    ? { pronto: true, falhou: false, indice: obterIndice(), recarregar: iniciar }
    : { pronto: false, falhou, recarregar: iniciar }
}

export function useMes(ano, mes) {
  const [, atualizar] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    carregarMes(ano, mes).catch(() => {})
    return ouvirIndice(atualizar)
  }, [ano, mes])

  const chave = `${ano}-${pad2(mes)}`
  return cacheDoMes(chave) || { chave, fase: 'carregando' }
}