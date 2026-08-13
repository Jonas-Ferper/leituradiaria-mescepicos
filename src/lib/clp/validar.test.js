import { describe, expect, it } from 'vitest'
import {
  MESES,
  MESES_CAP,
  DIA_SEMANA,
  SEMANA_ABREV,
  CORES_LITURGICAS,
  pad2,
  diaKey,
  nomeMes,
  numeroMes,
  validarDia,
  validarMes,
} from './validar.js'

function diaValido(extra = {}) {
  return {
    dataCivil: '2026-08-15',
    diaSemanaCivil: 'sábado',
    anoLiturgico: '2026/2027',
    cicloDominical: 'B',
    cicloFerial: 'par',
    tempoLiturgico: 'TC',
    tempoLiturgicoNome: 'Tempo Comum',
    semanaLiturgica: 'Semana 19',
    categoriaLiturgica: 'FER',
    corLiturgica: 'Verde',
    chaveCanonica: '2026-08-15',
    celebracaoPrincipal: { nome: 'Sábado da semana XVIII', categoriaNome: 'Féria', natureza: 'Féria' },
    ...extra,
  }
}

function mesValido(extra = {}) {
  return {
    versao: 1,
    tipo: 'liturgia-mensal',
    ano: 2026,
    mes: 8,
    nomeMes: 'Agosto',
    inicio: '2026-08-01',
    fim: '2026-08-31',
    totalDias: 2,
    dias: [
      diaValido({ dataCivil: '2026-08-01', diaSemanaCivil: 'sábado' }),
      diaValido({ dataCivil: '2026-08-02', diaSemanaCivil: 'domingo' }),
    ],
    ...extra,
  }
}

describe('MESES', () => {
  it('tem doze meses em ordem', () => {
    expect(MESES).toHaveLength(12)
    expect(MESES[0]).toBe('janeiro')
    expect(MESES[11]).toBe('dezembro')
  })

  it('MESES_CAP capitaliza', () => {
    expect(MESES_CAP[7]).toBe('Agosto')
  })
})

describe('mapas', () => {
  it('DIA_SEMANA começa em domingo=0 e sábado=6', () => {
    expect(DIA_SEMANA.domingo).toBe(0)
    expect(DIA_SEMANA['sábado']).toBe(6)
  })

  it('SEMANA_ABREV tem 7 e começa seg', () => {
    expect(SEMANA_ABREV).toHaveLength(7)
    expect(SEMANA_ABREV[0]).toBe('seg')
  })

  it('CORES_LITURGICAS normaliza variantes', () => {
    expect(CORES_LITURGICAS.branco).toBe('Branco')
    expect(CORES_LITURGICAS.negro).toBe('Preto')
  })
})

describe('utilitários', () => {
  it('pad2 dá dois algarismos', () => {
    expect(pad2(5)).toBe('05')
    expect(pad2(12)).toBe('12')
  })

  it('diaKey monta YYYY-MM-DD', () => {
    expect(diaKey(2026, 8, 5)).toBe('2026-08-05')
  })

  it('nomeMes devolve capitalizado ou vazio', () => {
    expect(nomeMes(8)).toBe('Agosto')
    expect(nomeMes(0)).toBe('')
    expect(nomeMes(13)).toBe('')
  })

  it('numeroMes aceita número e nome', () => {
    expect(numeroMes('8')).toBe(8)
    expect(numeroMes('agosto')).toBe(8)
    expect(numeroMes('nada')).toBe(-1)
  })
})

describe('validarDia', () => {
  it('aceita um dia completo', () => {
    const r = validarDia(diaValido())
    expect(r.ok).toBe(true)
    expect(r.erros).toEqual([])
  })

  it('rejeita dia sem campo obrigatório', () => {
    const d = diaValido()
    delete d.corLiturgica
    const r = validarDia(d)
    expect(r.ok).toBe(false)
    expect(r.erros.join()).toContain('corLiturgica')
  })

  it('rejeita dataCivil malformada', () => {
    const r = validarDia(diaValido({ dataCivil: '15/08/2026' }))
    expect(r.ok).toBe(false)
    expect(r.erros.join()).toContain('dataCivil malformada')
  })

  it('rejeita não-objeto', () => {
    const r = validarDia(null)
    expect(r.ok).toBe(false)
  })
})

describe('validarMes', () => {
  it('aceita um mês válido', () => {
    const r = validarMes(mesValido())
    expect(r.ok).toBe(true)
    expect(r.data.dias).toHaveLength(2)
  })

  it('rejeita mês sem dias', () => {
    const r = validarMes(mesValido({ dias: [] }))
    expect(r.ok).toBe(false)
  })

  it('rejeita totalDias divergente', () => {
    const r = validarMes(mesValido({ totalDias: 30 }))
    expect(r.ok).toBe(false)
    expect(r.erros.join()).toContain('totalDias')
  })

  it('propaga erro de dia para a lista de erros', () => {
    const m = mesValido()
    m.dias[1] = diaValido({ dataCivil: 'bad' })
    const r = validarMes(m)
    expect(r.ok).toBe(false)
    expect(r.erros.join()).toContain('dataCivil malformada')
  })

  it('rejeita ficheiro não-objeto', () => {
    const r = validarMes('oops')
    expect(r.ok).toBe(false)
  })
})