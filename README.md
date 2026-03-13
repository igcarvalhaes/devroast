# devroast

Paste your code. Get roasted.

**devroast** e uma aplicacao web onde voce cola um trecho de codigo e recebe uma avaliacao brutalmente honesta — com direito a nota, sugestoes de melhoria e, claro, um bom roast.

> Projeto construido durante o evento **NLW** da [Rocketseat](https://rocketseat.com.br), ao longo das aulas do evento.

## O que e o devroast?

Todo desenvolvedor ja escreveu aquele codigo que "funciona, mas ninguem deveria ver". O devroast existe para isso: voce submete seu codigo e descobre exatamente o quao ruim (ou bom) ele realmente e.

### Funcionalidades

- **Code Input** — Cole seu codigo diretamente no editor com syntax highlighting e envie para analise
- **Roast Mode** — Escolha entre feedback honesto ou modo roast completo para uma avaliacao sem filtros
- **Score** — Receba uma nota de 0 a 10 com visualizacao em anel de progresso colorido
- **Diff de sugestoes** — Veja exatamente o que deveria mudar no seu codigo, linha por linha
- **Code Review** — Blocos de codigo com syntax highlighting mostrando a versao original e a sugerida
- **Shame Leaderboard** — Os piores codigos submetidos, rankeados por vergonha para todo mundo ver

### Como funciona

1. Acesse a homepage e cole seu codigo no editor
2. Escolha entre modo "honest" ou "roast"
3. Clique em "submit for roasting"
4. Receba seu score, feedback detalhado e sugestoes de melhoria
5. Se o codigo for ruim o suficiente, ele pode parar no leaderboard

## Rodando localmente

```bash
pnpm install
pnpm dev
```

O app estara disponivel em `http://localhost:3000`.

## Tecnologias

- [Next.js](https://nextjs.org/) — Framework React com App Router
- [Tailwind CSS](https://tailwindcss.com/) — Estilizacao utility-first
- [Shiki](https://shiki.style/) — Syntax highlighting
- [Biome](https://biomejs.dev/) — Linter e formatter

## Licenca

MIT
