# Como publicar uma atualização (guia rápido)

Cada alteração publica-se com **um `git push`** — o Netlify compila sozinho e o site
fica novo em ~30–40 s. Detalhe completo: **`status.md` §9C** (runbook).

## 1. Editar

- Dados → colocar/corrigir `clp-YYYY-MM.json` na **raiz** (nunca em `public/data/`).
- Código → `src/…`, `index.html`, `public/…`.

## 2. Validar e gerar localmente

```
npm run data
npm test
node scripts/audit-data.mjs
npm run build
```

(O `status.md` §9C.3 explica quando cada um é obrigatório; `audit` avisa sobre meses com problema.)

## 3. Verificar o que vai entrar

```
git status
```

Devem aparecer só as alterações intencionais (`node_modules/`, `dist/`, `public/data/` são ignorados).

## 4. Commit + push

```
git add -A
git commit -m "Resumo do que mudou"
git push
```

## 5. Confirmar no ar (~30–40 s depois)

```
for r in / /hoje /calendario /propostas /memorial /busca /sobre /data/index.json; do
  echo "$r → $(curl -s -o /dev/null -w '%{http_code}' https://leituradiaria-mescepicos.netlify.app$r)"
done
```

Checksum do ícone (logo MESCE): `curl -s https://leituradiaria-mescepicos.netlify.app/icons/icon-512.png | md5sum`
→ `c2688f1dcb0da07bce75720f4c9261be` (estável graças ao `-strip` do `gen-icons`)

Tudo 200 = publicado. Verde em `<https://app.netlify.com/sites/leituradiaria-mescepicos/deploys>` = deploy OK.

## Casos de cada tipo de alteração

- **Mês novo / corrigir dia:** apenas `clp-YYYY-MM.json` na raiz → §9C.6.
- **Ícone/logo:** substituir `logosite.png` → `npm run gen-icons` → §9C.8.
- **Falhou?** o deploy não disparou, ícone antigo no telemóvel, rollover, Node…
  tudo em `status.md` §9C.7.

## Ligações

- Repo: `https://github.com/Jonas-Ferper/leituradiaria-mescepicos`
- Site: `https://leituradiaria-mescepicos.netlify.app/`
- Deploys/log: `https://app.netlify.com/sites/leituradiaria-mescepicos/deploys`