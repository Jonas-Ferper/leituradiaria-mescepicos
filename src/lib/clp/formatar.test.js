import { describe, expect, it } from 'vitest'
import {
  COR_HEX,
  corLegivel,
  diaDaSemana,
  indexDiaSemana,
  nomeDoMes,
  nomeDoMesCap,
  capitalizar,
  dataPorExtenso,
  dataCurta,
  corDoTempo,
  normalizarTexto,
  artigoTempo,
} from './formatar.js'

describe('COR_HEX / corLegivel', () => {
  it('mapeia as cores canónicas', () => {
    expect(corLegivel('Verde')).toBe('#57a678')
    expect(corLegivel('Branco')).toBe(COR_HEX.Branco)
  })

  it('tem um fallback para cores desconhecidas', () => {
    expect(corLegivel('Neon')).toBe('#e0bd72')
    expect(corLegivel()).toBe('#e0bd72')
  })
})

describe('dias da semana', () => {
  it('diaDaSemana devolve o nome por extenso', () => {
    expect(diaDaSemana('segunda-feira')).toBe('Segunda-feira')
    expect(diaDaSemana('domingo')).toBe('Domingo')
  })

  it('diaDaSemana devolve vazio sem entrada', () => {
    expect(diaDaSemana('')).toBe('')
  })

  it('indexDiaSemana dá índice 0..6', () => {
    expect(indexDiaSemana('domingo')).toBe(0)
    expect(indexDiaSemana('sábado')).toBe(6)
    expect(indexDiaSemana('desconhecido')).toBe(-1)
  })
})

describe('meses', () => {
  it('nomeDoMes minúsculo e nomeDoMesCap capitalizado', () => {
    expect(nomeDoMes(8)).toBe('agosto')
    expect(nomeDoMesCap(8)).toBe('Agosto')
  })

  it('capitalizar', () => {
    expect(capitalizar('abc')).toBe('Abc')
    expect(capitalizar('')).toBe('')
  })
})

describe('datas', () => {
  it('dataPorExtenso', () => {
    expect(dataPorExtenso('2026-08-15')).toBe('15 de agosto de 2026')
  })

  it('dataPorExtenso rejeita entradas vazias/malformadas', () => {
    expect(dataPorExtenso('')).toBe('')
    expect(dataPorExtenso('xx')).toBe('')
  })

  it('dataCurta devolve dia + mês abreviado', () => {
    expect(dataCurta('2026-08-15')).toBe('15 Ago')
  })
})

describe('corDoTempo', () => {
  it('mapeia tempos por nome', () => {
    expect(corDoTempo('Tempo Comum')).toBe('Verde')
    expect(corDoTempo('Advento')).toBe('Roxo')
    expect(corDoTempo('Quaresma')).toBe('Roxo')
    expect(corDoTempo('Tempo Pascal')).toBe('Branco')
    expect(corDoTempo('Natal')).toBe('Branco')
  })

  it('mapeia códigos curtos', () => {
    expect(corDoTempo('TC')).toBe('Verde')
    expect(corDoTempo('TQ')).toBe('Roxo')
    expect(corDoTempo('AD')).toBe('Roxo')
    expect(corDoTempo('TP')).toBe('Branco')
    expect(corDoTempo('NA')).toBe('Branco')
  })

  it('tem um padrão seguro', () => {
    expect(corDoTempo('')).toBe('Verde')
  })
})

describe('normalizarTexto', () => {
  it('retira acentos e passa a minúsculas', () => {
    expect(normalizarTexto('Assunção de Nossa Senhora')).toBe('assuncao de nossa senhora')
  })
})

describe('artigoTempo', () => {
  it('usa "do" para tempos que começam por "Tempo"', () => {
    expect(artigoTempo('Tempo Comum')).toBe('do')
    expect(artigoTempo('Tempo do Advento')).toBe('do')
    expect(artigoTempo('Tempo do Natal')).toBe('do')
    expect(artigoTempo('Tempo Pascal')).toBe('do')
  })

  it('usa "da" para tempos femininos', () => {
    expect(artigoTempo('Quaresma')).toBe('da')
  })

  it('usa "do" para tempos masculinos sem prefixo "Tempo"', () => {
    expect(artigoTempo('Advento')).toBe('do')
    expect(artigoTempo('Natal')).toBe('do')
  })

  it('tem um padrão seguro', () => {
    expect(artigoTempo('')).toBe('do')
    expect(artigoTempo()).toBe('do')
  })
})