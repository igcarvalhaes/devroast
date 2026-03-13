# Padrões de criação de componentes UI

Este documento define os padrões que devem ser seguidos ao criar componentes
dentro de `src/components/ui/`. Todos os agentes e desenvolvedores devem
seguir essas convenções para manter consistência no projeto.

---

## Regras gerais

1. **Named exports apenas** — nunca use `export default`. Exporte o componente,
   a função de variantes, e os tipos com `export { ... }`.

2. **Estender props nativas** — use `ComponentProps<"elemento">` do React para
   herdar todas as propriedades nativas do elemento HTML correspondente.

3. **`forwardRef` sempre** — todos os componentes devem encaminhar a ref para
   o elemento HTML raiz usando `forwardRef`.

4. **`displayName`** — defina `Component.displayName = "Component"` logo após
   o `forwardRef` para facilitar debugging no React DevTools.

5. **Um componente por arquivo** — cada arquivo em `ui/` deve conter o componente
   raiz e seus sub-componentes composicionais relacionados.

---

## Estilização com Tailwind Variants

Usamos `tailwind-variants` (`tv`) para definir variantes de estilo. O
`tailwind-variants` já utiliza `tailwind-merge` internamente para resolver
conflitos de classes, então **nunca** importe ou use `tailwind-merge`
diretamente nos componentes.

### Passando `className` externo

Passe `className` como propriedade direta na chamada do `tv()`, junto com
`variant` e `size`. O `tailwind-variants` faz o merge automaticamente:

```tsx
// CORRETO — className como prop do tv()
<button className={button({ variant, size, className })} />

// ERRADO — NÃO use cn() ou twMerge() para combinar com className
<button className={cn(button({ variant, size }), className)} />
```

### Estrutura da função `tv()`

```tsx
const component = tv({
  base: [
    // Classes base que sempre se aplicam.
    // Separe em arrays por responsabilidade para facilitar leitura.
    "inline-flex items-center justify-center",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2",
  ],
  variants: {
    variant: {
      primary: "...",
      secondary: "...",
    },
    size: {
      sm: "...",
      md: "...",
      lg: "...",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

---

## Padrão de composição (Composition Pattern)

Componentes com sub-partes internas devem usar o **padrão de composição**.
O componente Root provê Context para que os sub-componentes herdem variantes
e estado sem precisar receber props explicitamente.

### Quando usar

- O componente tem 2+ sub-partes visuais distintas (ex: dot + label, prefix + code)
- O consumidor pode querer omitir, reordenar ou customizar sub-partes
- O componente raiz define variante/estado compartilhado entre filhos

### Estrutura de um componente composto (client)

```tsx
"use client";

import { type ComponentProps, createContext, forwardRef, useContext } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/* ── Context ─────────────────────────────────── */

type BadgeContextValue = {
  variant: "critical" | "warning" | "good";
};

const BadgeContext = createContext<BadgeContextValue>({ variant: "good" });

function useBadgeContext() {
  return useContext(BadgeContext);
}

/* ── Sub-components ──────────────────────────── */

const BadgeDot = forwardRef<HTMLSpanElement, ComponentProps<"span">>(
  ({ className, ...props }, ref) => {
    const { variant } = useBadgeContext();
    return <span ref={ref} className={badgeDot({ variant, className })} {...props} />;
  },
);
BadgeDot.displayName = "BadgeDot";

/* ── Root ────────────────────────────────────── */

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "good", children, ...props }, ref) => {
    return (
      <BadgeContext value={{ variant: variant ?? "good" }}>
        <span ref={ref} {...props}>{children}</span>
      </BadgeContext>
    );
  },
);
Badge.displayName = "Badge";

// Uso:
// <Badge variant="critical">
//   <BadgeDot />
//   <BadgeLabel>critical</BadgeLabel>
// </Badge>
```

### Componentes RSC (sem Context)

Para componentes que são React Server Components (ex: `CodeBlock`), **não**
é possível usar Context. Nesse caso, os sub-componentes recebem dados via
**props diretas**:

```tsx
// Sub-componente recebe props diretamente
const CodeBlockBody = forwardRef<HTMLDivElement, { html: string; lineCount: number }>(
  ({ html, lineCount, ...props }, ref) => { /* ... */ },
);

// Convenience wrapper (async RSC)
async function CodeBlock({ code, language, filename, className }) {
  const html = await codeToHtml(code.trim(), { lang: language, theme: "vesper" });
  const lineCount = code.trim().split("\n").length;

  return (
    <CodeBlockRoot className={className}>
      <CodeBlockHeader filename={filename} />
      <CodeBlockBody html={html} lineCount={lineCount} />
    </CodeBlockRoot>
  );
}
```

### Default children

Componentes compostos devem renderizar **default children** quando `children`
não é fornecido. Isso permite o uso simples (sem composição) enquanto mantém
a API composicional disponível:

```tsx
// Uso simples — root renderiza default children automaticamente
<ScoreRing score={7.5} />

// Uso composicional — consumer controla a estrutura
<ScoreRing score={7.5}>
  <svg>
    <ScoreRingTrack />
    <ScoreRingArc />
  </svg>
  <ScoreRingLabel />
</ScoreRing>
```

---

## Estrutura do componente (leaf — sem sub-partes)

Siga este template ao criar componentes simples sem sub-partes:

```tsx
import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const component = tv({
  base: ["..."],
  variants: {
    variant: { /* ... */ },
    size: { /* ... */ },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ComponentVariants = VariantProps<typeof component>;

type ComponentProps = ComponentProps<"div"> & ComponentVariants;

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={component({ variant, size, className })}
        {...props}
      />
    );
  },
);

Component.displayName = "Component";

export { Component, component, type ComponentProps, type ComponentVariants };
```

---

## Fontes

O projeto usa três famílias de fonte configuradas via Tailwind `@theme`:

- **`font-sans`** — fonte padrão do sistema (sem import externo). Use para
  texto de interface geral: títulos, labels, parágrafos.
- **`font-mono`** — JetBrains Mono (carregada via `next/font/google`). Use
  para texto monospaced: botões, código, badges, terminais.
- **`font-body-mono`** — IBM Plex Mono (carregada via `next/font/google`). Use
  para subtítulos, hints e texto descritivo com estilo monospaced.

Nunca use classes como `font-primary` ou `font-secondary`. Use apenas as
classes nativas do Tailwind: `font-sans`, `font-mono`, `font-body-mono`.

As variáveis de tema são definidas em `globals.css` via `@theme`:

```css
@theme {
  --font-mono: "JetBrains Mono", ui-monospace, ...;
  --font-body-mono: "IBM Plex Mono", ui-monospace, ...;
}
```

O `--font-sans` usa o valor padrão do Tailwind (system fonts).

---

## Checklist para novos componentes

- [ ] Named exports (nunca `export default`)
- [ ] Extende props nativas via `ComponentProps<"elemento">`
- [ ] Usa `forwardRef` com ref encaminhada ao elemento raiz
- [ ] Define `displayName`
- [ ] Variantes definidas com `tv()` do `tailwind-variants`
- [ ] `className` externo passado como prop do `tv()` (sem `cn` / `twMerge`)
- [ ] `defaultVariants` definidas
- [ ] Tipos exportados: `ComponentProps` e `ComponentVariants`
- [ ] Função de variantes exportada (ex: `button`) para uso externo se necessário
- [ ] Lint passando (`pnpm lint`)
- [ ] Composição: se tem sub-partes, usa Context (client) ou props (RSC)
- [ ] Composição: root renderiza default children quando `children` não é fornecido
