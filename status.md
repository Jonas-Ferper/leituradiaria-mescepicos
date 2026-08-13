# STATUS DO PROJETO — Calendário Litúrgico Perpétuo

Documento de referência para **agentes/IA (ou pessoas)** que forem ler ou editar este
repositório. Explica a arquitetura, as regras não-negociáveis e o modo de verificação
antes de qualquer alteração.

---

## 1. O que é

Sítio web (SPA) que apresenta um **calendário litúrgico incremental** da Igreja Católica
Romana. A fonte de dados são ficheiros JSON mensais colocados na RAZ do projeto:

```
clp-YYYY-MM.json        (ex.: clp-2026-08.json)
```

O sistema NUNCA conhece a lista de meses "por dentro". Ele descobre os ficheiros,
valida-os, gera um índice e monta o calendário/navegação automaticamente. Colocar um
novo JSON na raiz é suficiente para o mês passar a existir no sítio — sem alterar
componentes, rotas, menus ou constantes.

- Stack: **Vite 6 + React 18 + React Router 6** (JavaScript, sem TypeScript).
- Idioma da interface: **português europeu** (pt-PT), coerente com os dados.
- Testes unitários com **Vitest** (`npm test`); a verificação final é feita por
  `npm run build` + navegação headless em Chromium (ver §12).

---

## 2. Regras não-negociáveis (ler primeiro)

1. **O JSON é a fonte de verdade.** Nunca copiar para o frontend listas fixas como
   `const agostoDays = [...]`, arrays manuais de meses, ou datas hardcoded.
2. Toda a descoberta de dados passa por `src/lib/clp/data.js`. A UI depende dessa
   abstração, nunca de uma forma direta como `fetch('data/clp-…')` nos componentes.
3. Nunca assumir: quantidade de ficheiros, que começam em janeiro, que todos os meses
   existem, ou quantidade de anos.
4. Um ficheiro corrompido NUNCA deve derrubar a aplicação: marca-se o mês como
   indisponível e continua-se com o resto.
5. Não criar ficheiros de dados em `src/`; dados não entram no bundle JavaScript.
6. Manter `validar.js` independente de browser (é importada tanto pelo script Node
   quanto pelo frontend).

---

## 3. Estrutura de diretórios

```
site_liturgia/
├── clp-YYYY-MM.json          ← DADOS (fonte de verdade), não mexer na estrutura
```
├── scripts/
│   ├── build-data.mjs        ← autodescoberta + validação + geração do índice
│   └── audit-data.mjs        ← auditoria dos JSONs-fonte + regras de coerência JSON→UI
├── public/
│   └── data/                 ← GERADO (não editar à mão; ver .gitignore)
│       ├── index.json        ← metadados de todos os meses
│       └── clp-YYYY-MM.json  ← cópias dos ficheiros para servir
├── index.html
├── package.json  vite.config.js
└── src/
    ├── main.jsx              ← entrada + <BrowserRouter>
    ├── App.jsx               ← definição das rotas
    ├── styles.css            ← todo o CSS (design system, variaveis)
    ├── lib/clp/
    │   ├── validar.js        ← validação pura (mês + dia) + utilitários (pad2, DIA_SEMANA…)
    │   ├── fetcher.js        ← abstração da origem (hoje: ficheiros; futuro: API/CDN)
    │   ├── data.js           ← camada de dados central (índice, cache, getters, navegação)
    │   ├── formatar.js       ← cor/tempo/categoria/data por extenso/etc.
    │   └── hooks.js          ← hooks React (useIndice, useMes)
    ├── components/           ← peças de UI reutilizáveis
    └── pages/                ← uma página por rota
```

> `public/data/` e `dist/` são gerados e ignorados por git. Nunca editar `public/data`
> à mão — é sempre `npm run data` (ou o `predev`/`prebuild`) que o regenera.

---

## 4. Modelo de dados

### 4.1 Ficheiro mensal (clp-YYYY-MM.json)

```
{
  versao, tipo, ano, mes, nomeMes,
  inicio, fim, totalDias, comLeituras,
  dias: [
    {
      dataCivil,            // "YYYY-MM-DD"
      diaSemanaCivil,       // "Terça-feira", "Sábado"…
      anoLiturgico, cicloDominical, cicloFerial,
      tempoLiturgico, tempoLiturgicoNome, semanaLiturgica,
      celebracaoPrincipal: {
        nome, categoria, categoriaNome, natureza,
        cor, precedencia, chaveCanonica, status,
        possuiLeiturasProprias
      },
      celebracoesImpedidas: [...],
      categoriaLiturgica, precedencia, corLiturgica,
      chaveCanonica, chaveFeriaDoDia, chaveLeituras,
      momento, momentosDisponiveis,
      Leituras: {
        // chaves possíveis (nem todos os dias têm todas):
        primeiraLeitura, salmoResponsorial,
        segundaLeitura, aclamacaoEvangelho, evangelho
        // cada uma: { referencia, tipo, texto }
      },
      auditoria: {...}
    }
  ]
}
```

- Os ficheiros são JSON de UMA linha (minificados).
- Todos os dias atuais têm `Leituras`; domingos/solenidades têm `segundaLeitura`.

### 4.2 Índice (public/data/index.json — gerado)

Cada entrada `meses[]` tem: `mesChave` ("YYYY-MM"), `ano`, `mes`, `nomeMes`,
`arquivo`, `valido` (bool), `versao`, `inicio`, `fim`, `totalDias`,
`comLeituras` (nº de dias com leituras), `domingosNoMes`, `tempo` (dominante),
`cor`, `categoria`, `erro` (preenchido se inválido). O índice guarda também
`primeiro`/`ultimo` (primeiro e último mês VÁLIDOS) e `anos[]`.

---

## 5. Camada de dados (src/lib/clp/data.js)

Funções principais (tudo assíncrono quando envolve leitura):

| Função | Descrição |
|---|---|
| `descobrirIndice()` | Carrega `index.json` uma vez; notifica ouvintes |
| `anosDisponiveis()` | anos com meses no índice |
| `mesesDoAno(ano, {todos=true})` | metas do ano (todos inclui inválidos) |
| `metaMes(ano, mes)` | metadado do mês (ou null) |
| `statusMes(ano, mes)` | `'disponivel' \| 'indisponivel' \| 'ausente'` |
| `carregarMes(ano, mes)` | carrega+valida+cacheia o mês; lança `ClpErro` |
| `diaDe(ano, mes, dia)` | dia concreto (ou null) |
| `navegacaoDe(ano, mes)` | `{ anterior, seguinte }` (meses válidos) — usado para desabilitar setas |

- **Cache:** mapa `cacheMeses` (chave `"YYYY-MM"`). Cada entrada tem `fase`
  (`'carregando' | 'pronto' | 'erro'`) + `data`. Não há leituras duplicadas; a UI
  consome `useMes()` que devolve a entrada da cache.
- **Erros:** classe `ClpErro` com `codigo` (`MES_AUSENTE`, `MES_INDISPONIVEL`,
  `MES_INVALIDO`, `INDICE_INVALIDO`, `SEM_INDICE`). A UI nunca mostra erro técnico —
  mapeia para a página elegante de indisponibilidade.

### 5.1 Cache e futuridade
- `fetcher.js` é o único sítio que sabe de onde vêm os dados. Para trocar ficheiros
  por API/banco, altera-se apenas este ficheiro (ou acrescenta-se uma variante).
- `useMes(ano, mes)` chama `carregarMes` num `useEffect` e subscreve o store.

---

## 6. Validação (src/lib/clp/validar.js)

Pura (sem browser). Usada pelo script e pelo frontend.

- `validarMes(data)`: exige `versao, tipo, ano, mes, nomeMes, inicio, fim, totalDias,
  dias` (array não vazio), `ano`/`mes` numéricos, `totalDias === dias.length`, e valida
  cada dia. Retorna `{ ok, erros, data }`.
- `validarDia(dia)`: exige `dataCivil, diaSemanaCivil, anoLiturgico, cicloDominical,
  cicloFerial, tempoLiturgico, tempoLiturgicoNome, semanaLiturgica, categoriaLiturgica,
  corLiturgica, chaveCanonica` + `celebracaoPrincipal.nome`, e `dataCivil` no formato
  `YYYY-MM-DD`.
- Utilitários exportados: `pad2`, `diaKey`, `nomeMes`, `numeroMes`,
  `DIA_SEMANA` (mapa pt→índice), `SEMANA_ABREV` (seg..dom).

> `.gitignore` ignora `public/data/`. Isso é intencional: `index.json` e cópias são
> artefatos; a versão em git só deve conter os JSONs-fonte na raiz.

---

## 7. Roteamento (src/App.jsx)

```
/                                  Início (galeria de meses + hoje)
/hoje                              Liturgia do dia atual (independente do nº de ficheiros)
/busca                             Pesquisa pela biblioteca disponível
/calendario/:ano/:mes              Calendário do mês
/calendario/:ano/:mes/:dia         Dia completo (celebração + leituras)
*                                  Página 404 elegante
```

As rotas são **segmentos dinâmicos** — não são cadastradas mês a mês. Cada página
valida os parâmetros, chama `statusMes` e reencaminha para um destes estados:

- `'disponivel'` → conteúdo.
- `'ausente'` (futuro/não fornecido) → *"Calendário ainda não disponível"*.
- `'indisponivel'` (arquivo com erro) → *"Mês indisponível por erro de dados"*.
- dia inexistente no mês → *"Este dia não está no mês publicado"*.
- `meses.fase === 'erro'` → mesma página indisponível (mês que falhou ao carregar).

> Hospedagem estática precisa de rewrite de `/calendario/…` para `index.html`
> (SPA fallback).

---

## 8. Navegação dinâmica

- **Entre meses:** `navegacaoDe()` devolve o anterior/seguinte da cadeia de meses
  VÁLIDOS. As setas ficam `disabled` no primeiro/último publicados (ex.: em jan/2027,
  sem fev/2027, a seta seguinte está desativada). Sem data máxima hardcoded.
- **Entre anos:** `SeletorAno` é construído de `anosDisponiveis()`. Ao escolher um ano,
  navega para o primeiro mês existente desse ano.
- **Lacunas:** meses em falta não são inventados; a ausência mostra a página "não
  disponível". Na galeria, meses inválidos aparecem como cartão cinza "indisponível".

---

## 9. Design

CSS único em `src/styles.css`, tema **"missal noturno"**:
- Fundo tinta azul-violeta escura (`--tinta` #0e1120), texto pergaminho claro.
- Ouro de vela (`--ouro` #e0bd72) para destaques; cores litúrgicas `--verde/--roxo/
  --vinho/--rosa/--branco-lit` como acentos estruturais.
- Tipografia: **Fraunces** (display), **Instrument Sans** (corpo),
  **IBM Plex Mono** (dados/referências). Fallbacks locais em cada `--fonte-*`.
- **Assinatura visual:** a *fita litúrgica* (`FitaLiturgica`) — uma tira onde cada dia
  é uma célula de 2px colorida pelo tempo litúrgico. Aparece no topo das páginas de
  mês/dia e (numa variante por mês) na galeria.
- Contraste forte: as **Leituras** vivem num cartão "pergaminho" claro (`--parch`) em
  corpo de missal.
- Acessibilidade: `:focus-visible` dourado, `prefers-reduced-motion` respeitado,
  responsivo até mobile (grid do calendário colapsa a 7 colunas estreitas).
- **A11y (Fase C):** *skip-link* "Saltar para o conteúdo" (visível ao focar, no
  `Layout`) que leva a `<main id="conteudo">`; as células "hoje" do `CalendarioMes`
  usam `aria-current="date"`; todos os botões/links do calendário têm `aria-label`
  descritivo.
- **Code-splitting (Fase C):** as páginas `/hoje`, `/busca`, mês e dia são
  carregadas com `React.lazy` + `<Suspense>`; a home fica no bundle principal.
  **IMPORTANTE:** o `lazy` do React lê sempre `.default` — para componentes com
  *named exports* usar `lazy(() => import(...).then((m) => ({ default: m.X })))`.
  Sem isso as rotas falham com "Element type is invalid (resolves to undefined)".
- **Mobile UX (instalada/PWA):** alvos de toque ≥44px, `touch-action: manipulation`
  (sem duplo-toque de zoom), safe areas do iPhone (`env(safe-area-inset-*)` no
  `moldura`, masthead e footer), `min-height: 100dvh`, e barra do mês **fixa (sticky)**
  na home em ≤900px. Os estilos compactos de calendário estão **escopados a
  `.experiencia`** — a página de mês mantém nomes/realces de solenidade.
- Na home, em ecrãs ≤900px, escolher um dia rola suavemente até o painel de leituras
  (`HomePage`); trocar de mês volta ao topo. A primeira leitura abre por defeito.

> ao alterar o design: usar as variáveis CSS em `:root`, não cores soltas; manter o
> contraste da tinta/ouro/pergaminho; não adicionar animação sem justificação.

---

## 9A. PWA (instalável + offline)

O projeto é uma **Progressive Web App** (`vite-plugin-pwa`). O build de produção gera
`manifest.webmanifest`, `sw.js` e o registo automático em `index.html` (via `registerSW.js`).

- **Instalação:** Android/Chrome ("Instalar") e iOS/Safari ("Adicionar ao ecrã inicial").
  Ícones em `public/icons/` gerados a partir do **`logosite.png`** (raiz do projeto) por
  `scripts/gen-icons.sh` — versões `any` (corpo inteiro), `maskable` (fundo `#0e1120`
  opaco + logótipo a ~66% na zona segura), `apple-touch-icon` (180) e `favicon-64`.
  Metas Apple no `index.html`; safe areas via `env(safe-area-inset-*)` no CSS.
- **Precache (shell apenas):** JS/CSS/HTML + fontes (`public/fonts/`, self-hosted) + ícones.
  **Os JSONs de dados NUNCA vão para o precache.**
- **Cache de dados (runtime):**
  - `/data/index.json` → `NetworkFirst` (revalida em cada arranque online → novos meses
    aparecem sem atualizar o app; offline usa o último índice em cache);
  - `/data/clp-*.json` → `StaleWhileRevalidate` (o mês aberto fica em cache — a granularidade
    por mês inteiro dá offline "profundo" por mês visitado; correções propagam em 2.º plano).
- **Atualização do shell:** `registerType: 'autoUpdate'` (skipWaiting + clientsClaim) — uma
  nova versão assume silenciosamente; não há prompt.
- **Fontes self-hosted:** `scripts/fetch-fonts.mjs` descarrega os woff2 do Google Fonts e
  gera `src/fonts.css` (`@font-face` locais em `/fonts/`). **Não reintroduzir o `<link>` do
  Google Fonts** no `index.html` — offline depende destes ficheiros locais.
- **Ícones:** `scripts/gen-icons.sh` gera todos os PNGs a partir de `logosite.png`
  (raiz) com ImageMagick. Não editar os PNGs à mão; alterar o PNG-fonte e regenerar.

> Hospedagem de produção exige **HTTPS** (instalação). Se for servido em sub-roteiro,
> configurar `base` + `scope`/`start_url` no `vite.config.js`.

---

## 9B. Fase C — Qualidade

- **Auditoria de dados:** `scripts/audit-data.mjs` valida cada `clp-*.json` com o
  `validarMes` real + invariantes de coerência JSON→UI (datas consecutivas, dia da
  semana vs. data real, presença das leituras de base, campos de celebração, segunda
  leitura só em domingos/solenidades). Estado atual: **6 meses, 184 dias, 0 meses com
  problema**, 2 avisos suaves conhecidos:
  - `2026-10-12` — Féria (FER) com segunda leitura (anomalia real a confirmar);
  - `2026-11-09` — Festa "Dedic. Basílica Latrão" (FEST) com segunda leitura (aceitável).
- **Limpeza:** removidos exports/símbolos mortos (`dataKey`, `mesPorNumero`,
  `normalizarCor`, `normalizarCategoria`, `CAMPOS_MES/CAMPOS_DIA` do export,
  `CategoriaNome`, `CategoriaCurta`, `estadoIndice`, `diaDeHoje`,
  `intervaloDisponivel`, `nomeMesDe`, `resumoMemoria`), o componente `HojeCard.jsx`,
  `EsqueletoHoje` e o CSS do cartão "Hoje". A rota `/busca` (que existia sem rota) foi
  ligada em `App.jsx` e ao header.
- **Testes:** `src/lib/clp/validar.test.js` e `formatar.test.js` (32 testes).
- **Verificação final (Fase C):** `npm run data` → `node scripts/audit-data.mjs`
  (0 problemas) → `npm test` → `npm run build` → smoke headless de todas as rotas
  (todas com conteúdo e sem erros de consola).

---

## 9C. Publicação — atualizar o sistema, enviar para o GitHub e fazer deploy no Netlify (runbook)

Este é o fluxo completo a usar **em todas as atualizações**. Depois de montado uma
única vez, tudo é automático: **push no GitHub = publicação no Netlify em ~30–40 s**.

### 9C.1 Visão geral do pipeline

```
editar local ──► validar/build local ──► git push (branch main)
                                             │
                                             ▼
              Netlify (hook do GitHub)  ──► npm run build  (lê netlify.toml)
                                             │
                                             ▼
                                 publica dist/ → https://leituradiaria-mescepicos.netlify.app/
```

- O **GitHub é o único ponto de verdade** do código-fonte. O Netlify corre
  `npm run build`, e o `package.json` tem `prebuild = npm run data` — por isso até
  dados novos (JSONs na raiz) chegam ao ar sem mexer em código, ver §9C.6.
- `netlify.toml` (na raiz do repo) já diz ao Netlify: `command = "npm run build"`,
  `publish = "dist"`, `NODE_VERSION = 20`. **Não há uploads manuais** (o deploy por
  drag & drop foi abandonado — ver Histórico, §9C.9).
- `public/_redirects` (`/* /index.html 200`, fallback SPA) vive no repo e entra no
  `dist/` automaticamente via Vite (cópia de `public/`) — não se configura no painel.

### 9C.2 Pré-requisitos (feitos uma vez por máquina)

- **Git** com identidade do projeto:
  ```
  git config user.name  "Paroquianos do Junco"
  git config user.email paroquianosdojuncocom@gmail.com
  ```
- **Chave SSH do GitHub** a funcionar. Teste: `ssh -T git@github.com` →
  `Hi Jonas-Ferper!`. Remote do repo:
  ```
  git remote -v   # deve mostrar
  origin  git@github.com:Jonas-Ferper/leituradiaria-mescepicos.git (fetch/push)
  ```
  (se faltar: `git init -b main` + `git remote add origin git@github.com:Jonas-Ferper/leituradiaria-mescepicos.git`)
- **Netlify ligado ao repo correto** (uma vez):
  1. `https://app.netlify.com/sites/leituradiaria-mescepicos/settings/deploys`
     → seção **Continuous deployment** → **Change/Link repository**;
  2. autorizar o **Netlify GitHub App** na conta `Jonas-Ferper` quando o GitHub pedir;
  3. escolher `Jonas-Ferper/leituradiaria-mescepicos`, **branch `main`**;
  4. o `netlify.toml` preenche sozinho *Build command* (`npm run build`) e
     *Publish directory* (`dist`) — apenas confirmar e **Save**; começa o 1.º build.
- **Dependências instaladas:** `npm install`.

### 9C.3 Fluxo normal — publicar uma alteração (passo a passo)

1. **Editar.** Dados → colocar/corrigir `clp-YYYY-MM.json` na **raiz** do projeto
   (nunca em `public/data/`, que é gerado e ignorado por git). Código → `src/…`,
   `index.html`, `public/…`.
2. **Validar/gerar localmente (obrigatório antes do push):**
   ```
   npm run data                          # regenera public/data a partir da raiz
   npm test                              # 32 testes unitários (validar/formatar)
   node scripts/audit-data.mjs           # 0 meses com problema (avisos §9B)
   npm run build                         # gera dist/ real (inclui PWA)
   ```
3. **Ver o que vai entrar:** `git status` — deve listar apenas as mudanças
   intencionais. `node_modules/`, `dist/`, `public/data/` estão no `.gitignore` e
   NÃO entram.
4. **Commit + push:**
   ```
   git add -A
   git commit -m "Resumo do que mudou"
   git push
   ```
5. **Esperar ~30–40 s** e confirmar no ar com o checklist §9C.4.

### 9C.4 Checklist de verificação no ar (comandos prontos)

```
# 1) rotas principais + índice de dados (todas devem dar 200)
for r in / /hoje /calendario /propostas /memorial /busca /sobre /data/index.json; do
  echo "$r → $(curl -s -o /dev/null -w '%{http_code}' https://leituradiaria-mescepicos.netlify.app$r)"
done

# 2) bundle de produção servido — o hash muda a CADA build (deteta rollover):
curl -s https://leituradiaria-mescepicos.netlify.app/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'

# 3) conteúdo novo visível? procurar um texto que só o novo build tem:
js=$(curl -s https://leituradiaria-mescepicos.netlify.app/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "https://leituradiaria-mescepicos.netlify.app/$js" | grep -c 'TEXTO-UNICO-NOVO'

# 4) ícone MESCE (checksum esperado):
curl -s https://leituradiaria-mescepicos.netlify.app/icons/icon-512.png | md5sum
# → ac2900270ca2ef215bb88377365ae1c4
```

No painel → Deploys (`https://app.netlify.com/sites/leituradiaria-mescepicos/deploys`)
deve estar o commit mais recente com estado **Published** (verde). "Building" =
ainda a compilar; vermelho = deploy falhou (ver §9C.7).

### 9C.5 Exemplo real — teste de auto-deploy (2026-08-13)

Para provar o ciclo, adicionou-se o marcador temporário `DEPLOY-OK-20260813` no
rodapé (`src/components/Layout.jsx`), fez-se push e observou-se:

| Passo | Comando | Resultado no ar (~30 s após push) |
|---|---|---|
| Antes | `git push` anterior | bundle `assets/index-DnoAKJxt.js` sem marcador |
| Push com marcador | `git push` (commit `18939a2`) | `assets/index-B7NYatM7.js` **com** `DEPLOY-OK-20260813` ✔ |
| Push de reversão | `git push` (commit `bc98d5e`) | de volta a `assets/index-DnoAKJxt.js` (190 939 bytes) sem marcador ✔ |

O **hash do bundle muda a cada `npm run build`** → é o indicador fiável de que o
deploy novo chegou ao ar. Nota: durante a troca (~1 s) um curl pode apanhar a
resposta ainda do antigo/um asset vazio — repetir.

### 9C.6 Cenário típico — publicar um mês novo / corrigir um dia

1. Recebeu `clp-2027-01.json` → colocar na **raiz** do repo.
2. `npm run data` → `node scripts/audit-data.mjs` (0 problemas) → `npm test`.
3. `npm run build` (gera o dist novo) → commit → `git push`.
4. No ar: `/data/index.json` passa a listar o mês; abrir `/calendario/2027/01` e um
   dia com leituras. Índice, galeria, navegação e busca descobrem o mês sozinhos
   (ver §1 e §8) — **sem alterar código**.

> Nota: mesmo que `public/data/` não vá para o git, o Netlify regenera-o no build
> porque `prebuild = npm run data`; os JSONs-fonte na raiz têm de estar committados.

### 9C.7 Troubleshooting

- **Deploy não dispara (painel Deploys vazio/badge cinza):** a ligação Git no painel
  pode estar no repo errado. Já aconteceu estar ligado a
  `jfernandesp/leituradiaria-mescepicos` (cópia do site compilado, sem `src/`), o
  que impedia os pushes do repo oficial de chegarem. Corrige-se em Site settings →
  Build & deploy → Continuous deployment → **Change repository** →
  `Jonas-Ferper/leituradiaria-mescepicos`. O Netlify faz o 1.º build sozinho.
- **Trocar a ligação por API NÃO dá:** o token Netlify usado tinha acesso só de
  leitura (qualquer PATCH/PUT dá 401); e ligar um repo GitHub exige **autorizar o
  Netlify GitHub App no GitHub** — passo que só o dono da conta faz no navegador.
  É operação de painel, não de código/script.
- **Ícone antigo no telemóvel (mesmo após deploy):** limitação das PWAs — o atalho
  no ecrã inicial só atualiza quando o app é **desinstalado e instalado novamente**.
  O site já está atualizado; não é falha do deploy.
- **Bundle "velho"/resposta vazia num curl logo após o push:** rollover atómico do
  Netlify de ~1 s — repetir o curl/checklist §9C.4.
- **Deploy falhou (vermelho):** ver o log do deploy. Causa típica: versão do Node —
  `NODE_VERSION = 20` no `netlify.toml` fixa já (Vite 6 pede ≥18/20).
- **Mês novo não aparece:** certifique-se de que o JSON-fonte está na raiz e
  committado; `public/data/` local regenera-se sozinho no build (prebuild).

### 9C.8 Ícones — como trocar a logo

1. Substituir `logosite.png` (raiz do projeto) — é a **fonte única**.
2. `npm run gen-icons` (chama `scripts/gen-icons.sh`, precisa de ImageMagick) →
   regenera `public/icons/*.png`: `any` (corpo inteiro), `maskable` (fundo `#0e1120`
   + logo a ~66% na zona segura), `apple-touch-icon` (180) e `favicon-64`.
3. `npm run build` (o Vite copia para `dist/`) → commit → `git push`.
4. No ar, confirmar o checksum do `icon-512.png` (§9C.4, esperado
   `ac2900270ca2ef215bb88377365ae1c4`).
5. Telemóvel: **reinstalar** o app para o ícone novo (limitação §9C.7).

Não editar os PNGs à mão — alterar o `logosite.png` e regenerar.

### 9C.9 Histórico (para não repetir)

- O site começou como **upload manual (drag & drop)** de um `dist` pronto no
  Netlify — sem repositório ligado.
- Esse deploy ficou, por descuido, ligado ao repo errado
  (`jfernandesp/leituradiaria-mescepicos`, cópia do site compilado, sem `src/`), o
  que impediu os pushes do repo oficial de chegarem ao ar (badge do painel cinza,
  ícones/UI antigos na produção).
- A ligação foi trocada para `Jonas-Ferper/leituradiaria-mescepicos` (branch
  `main`) com o `netlify.toml` já no repo (`a0705d3`). Desde então
  **push = publicação**, sem passos manuais. O auto-deploy foi comprovado com o
  teste do marcador (§9C.5).
- O repo `jfernandesp/...` ficou órfão — pode ser arquivado/apagado.

### 9C.10 Ligações úteis

- Código-fonte: `https://github.com/Jonas-Ferper/leituradiaria-mescepicos`
- Produção: `https://leituradiaria-mescepicos.netlify.app/`
- Painel Netlify (deploys/log): `https://app.netlify.com/sites/leituradiaria-mescepicos/deploys`
- Config build: `https://app.netlify.com/sites/leituradiaria-mescepicos/settings/deploys`

---

## 10. Comandos

```
npm run data      # regenera public/data (index.json + cópias) a partir da raiz
npm run dev       # = data + vite dev (servir local, hot reload)
npm run build     # = data + build de produção -> dist/ (inclui PWA: sw.js + manifest)
npm run preview   # = data + serve dist/ localmente
npm run gen-icons # regenera os ícones PWA a partir de logosite.png (raiz do projeto)
npm test          # Vitest — testes unitários de src/lib/clp (validar, formatar)
node scripts/audit-data.mjs  # auditoria dos JSONs-fonte (coerência JSON→UI)
```

**Novo mês:** colocar `clp-YYYY-MM.json` na raiz → `npm run data` (ou `npm run build`)
→ aparece sozinho no índice, galeria, navegação e busca. **Novo ano:** igual, sem
qualquer alteração de código. **Remover mês:** apagar o JSON e regenerar.

---

## 11. Convenções para quem edita (especialmente IA)

- **Hooks:** em páginas, todos os hooks devem ser chamados incondicionalmente no topo,
  antes de qualquer `return` condicional (ex.: `MesPage`/`DiaPage` chamam `useMes`
  mesmo quando os parâmetros são inválidos). Não mover `useMes` para depois de um
  guard.
- Estado da página: use o fluxo `!pronto → Carregando`, `statusMes !== 'disponivel'
  → PaginaIndisponivel`, `meses.fase === 'erro' → PaginaIndisponivel`, depois render.
- Imports relativos (`.js`/`.jsx` explicitos). Não há alias de módulo.
- Strings da UI em pt-PT. Sem emojis. Textos de estado servem para orientar o usuário
  (nunca mostrar erros técnicos).
- Se adicionar um novo campo ao JSON, atualizar `validar.js` (e o índice, se necessário
  em `build-data.mjs`) — nunca confiar que o dado "vai estar lá".
- `Leituras[x].referencia` pode ser vazio; `segundaLeitura` só existe em certos dias.
  Usar optional chaining ao acessar dados.

---

## 12. Verificação (como validar antes de entregar)

1. `npm test` — os 32 testes unitários de `validar.js`/`formatar.js` passam.
2. `node scripts/audit-data.mjs` — 0 meses com problema (avisos conhecidos em §9B).
3. `npm run build` — deve terminar sem erros.
2. **Teste incremental:** criar `cp clp-2027-01.json clp-2027-02.json` →
   `npm run data` → `public/data/index.json` deve ter `ultimo.mesChave === 2027-02`
   e `total === 7`; depois apagar o ficheiro e regenerar.
3. **Teste de corrupção:** criar `clp-2026-07.json` inválido → `npm run data` →
   `invalidos === 1`, `validos === 6`; e a página `/calendario/2026/07` deve mostrar
   *"Mês indisponível por erro de dados"* sem derrubar as restantes.
4. **Smoke headless** (nu browser real):
   ```
   npm run preview -- --port 4173 &
   chromium --headless --no-sandbox --virtual-time-budget=8000 --dump-dom \
     "http://localhost:4173/<rota>"
   ```
   Verificar: `/` (galeria), `/calendario/2026/08` (grid + setas desativadas nas
   pontas), `/calendario/2026/08/12` (celebração + leituras), `/calendario/2027/02`
   (página "ainda não disponível"), `/hoje`, `/calendario/abc/02` (404).
7. **Smoke PWA:** `npm run build` → confirmar em `dist/` a existência de
   `manifest.webmanifest`, `sw.js`, `registerSW.js`, `icons/*.png`, `fonts/*.woff2`;
   e `index.html` servido com `<link rel="manifest">` + `<script src="/registerSW.js">`.
   `dist/sw.js` deve conter `skipWaiting()` e as rotas runtime `/data/index.json`
   (NetworkFirst) e `/data/clp-.*.json` (StaleWhileRevalidate).
8. **Teste offline manual** (útil, não obrigatório): instalar no Chrome, abrir um mês
   com rede, passar a modo avião/recolher rede e reabrir o app — o mês visto e todas as
   suas leituras devem abrir; meses nunca abertos mostram o estado "não disponível".