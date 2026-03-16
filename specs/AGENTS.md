# Formato de Especificações

Specs na pasta `specs/` documentam features antes da implementação.

## Estrutura

```markdown
# Spec: [Nome da Feature]

## Status

`[planning|implemented|deprecated]` — descrição curta do estado atual

---

## Resumo

1-3 parágrafos descrevendo o que será implementado e por quê.

---

## Pesquisa e decisões (opcional)

Abordagens avaliadas, tabelas comparativas, justificativa da escolha técnica.

---

## Arquitetura

Diagrama de componentes/módulos, fluxo de dados, estrutura de pastas.

---

## Dependências

| Pacote | Versão | Propósito |
|---|---|---|
| `exemplo` | ^1.0.0 | Descrição |

---

## Implementação

Detalhamento técnico: código, hooks, componentes, queries, configuração.

---

## Tarefas de implementação (opcional)

- [ ] Tarefa 1
- [ ] Tarefa 2

---

## Considerações técnicas

Performance, acessibilidade, edge cases, trade-offs.

---

## Fora de escopo

Lista do que **não** será implementado nesta feature.
```

## Regras

- **Conciso mas completo** — detalhes suficientes para implementar sem ambiguidade
- **Decisões documentadas** — justificar escolhas técnicas com tabelas ou bullet points
- **Code snippets** — exemplos de código quando relevante (schemas, hooks, queries)
- **Status atualizado** — marcar como `implemented` após conclusão
- **Diagrams ASCII** — usar diagramas de árvore/fluxo quando necessário
- **Stack do projeto** — seguir convenções do `AGENTS.md` raiz (named exports, `tv()`, tokens, etc.)

## Quando criar

- Features novas não-triviais (>3 arquivos ou decisões técnicas significativas)
- Mudanças de infraestrutura (banco, ORM, serviços externos)
- Refactorings grandes que afetam múltiplos módulos
