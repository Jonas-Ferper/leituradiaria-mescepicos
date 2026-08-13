const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const MESES_CAP = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DIA_SEMANA = {
  domingo: 0, dom: 0,
  'segunda-feira': 1, segunda: 1, 'segunda': 1,
  'terça-feira': 2, 'terca-feira': 2, 'terça': 2, 'terca': 2,
  'quarta-feira': 3, 'quarta': 3,
  'quinta-feira': 4, quinta: 4,
  'sexta-feira': 5, sexta: 5,
  sábado: 6, sabado: 6, sáb: 6, sab: 6,
}

const SEMANA_ABREV = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

const CORES_LITURGICAS = {
  branco: 'Branco',
  vermelho: 'Vermelho',
  verde: 'Verde',
  roxo: 'Roxo',
  cor: 'Roxo',
  rosa: 'Rosa',
  'roupa-ropa': 'Rosa',
  preto: 'Preto',
  negro: 'Preto',
}

const CAMPOS_MES = ['versao', 'tipo', 'ano', 'mes', 'nomeMes', 'inicio', 'fim', 'totalDias', 'dias']

const CAMPOS_DIA = [
  'dataCivil', 'diaSemanaCivil', 'anoLiturgico', 'cicloDominical', 'cicloFerial',
  'tempoLiturgico', 'tempoLiturgicoNome', 'semanaLiturgica', 'categoriaLiturgica',
  'corLiturgica', 'chaveCanonica',
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

function diaKey(ano, mes, dia) {
  return `${ano}-${pad2(mes)}-${pad2(dia)}`
}

function nomeMes(mes) {
  return MESES_CAP[mes - 1] || ''
}

function numeroMes(nome) {
  const n = String(nome || '').trim()
  if (/^\d+$/.test(n)) return Number(n)
  const idx = MESES.findIndex((m) => m === n.toLowerCase())
  return idx >= 0 ? idx + 1 : -1
}

function validarDia(dia, log) {
  const erros = []
  if (!dia || typeof dia !== 'object') return { ok: false, erros: ['dia não é um objeto'] }

  for (const campo of CAMPOS_DIA) {
    if (!(campo in dia) || dia[campo] === null || dia[campo] === undefined || dia[campo] === '') {
      erros.push(`falta "${campo}"`)
    }
  }

  const ce = dia.celebracaoPrincipal
  if (!ce || typeof ce !== 'object' || !ce.nome) {
    erros.push('celebracaoPrincipal inválida')
  }

  const dataCivilValida =
    dia.dataCivil && /^\d{4}-\d{2}-\d{2}$/.test(String(dia.dataCivil))

  if (!dataCivilValida) erros.push('dataCivil malformada')

  if (dia.Leituras !== undefined && dia.Leituras !== null) {
    if (typeof dia.Leituras !== 'object') {
      erros.push('Leituras malformadas')
    }
  }

  if (log) log(`  dia ${dia.dataCivil || '?'}: ${erros.join('; ')}`)

  return { ok: erros.length === 0, erros }
}

function validarMes(data, log = () => {}) {
  const erros = []
  if (!data || typeof data !== 'object') {
    return { ok: false, erros: ['o ficheiro não é um JSON de objeto'], data: null }
  }

  for (const campo of CAMPOS_MES) {
    if (!(campo in data) || data[campo] === null || data[campo] === undefined) {
      erros.push(`falta "${campo}"`)
    }
  }

  if (!Array.isArray(data.dias) || data.dias.length === 0) {
    erros.push('"dias" não é uma lista ou está vazia')
  }

  if (typeof data.ano !== 'number' || typeof data.mes !== 'number') {
    erros.push('"ano"/"mes" devem ser números')
  }

  if (data.totalDias !== undefined && data.dias && data.dias.length !== data.totalDias) {
    erros.push(`totalDias (${data.totalDias}) difere de dias (${data.dias.length})`)
  }

  if (erros.length > 0) {
    log(`mês inválido: ${erros.join('; ')}`)
    return { ok: false, erros, data: null }
  }

  for (const [i, dia] of data.dias.entries()) {
    const r = validarDia(dia, log)
    if (!r.ok) {
      erros.push(`dia #${i + 1} (${dia?.dataCivil || 'sem data'}): ${r.erros.join('; ')}`)
    }
  }

  return { ok: erros.length === 0, erros, data }
}

export {
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
}