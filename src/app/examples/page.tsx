import { Badge, BadgeDot, BadgeLabel } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine, DiffLineCode, DiffLinePrefix } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { ToggleDemo } from "./toggle-demo";

const buttonVariants = ["primary", "secondary", "outline", "ghost", "destructive", "link"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

export default function ExamplesPage() {
	return (
		<div className="min-h-screen bg-bg-page p-12 text-text-primary">
			<h1 className="mb-2 font-mono text-3xl font-bold text-accent-green">UI Components</h1>
			<p className="mb-12 text-sm text-text-secondary">
				Showcase de todos os componentes com suas variantes.
			</p>

			<div className="space-y-16">
				{/* ── Button ──────────────────────────────────────────── */}
				<section className="space-y-10">
					<h2 className="border-b border-border-primary pb-2 font-mono text-xl font-semibold text-text-primary">
						Button
					</h2>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Variants</h3>
						<div className="flex flex-wrap items-center gap-4">
							{buttonVariants.map((variant) => (
								<Button key={variant} variant={variant}>
									{variant}
								</Button>
							))}
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Sizes</h3>
						{buttonSizes.map((size) => (
							<div key={size} className="flex flex-wrap items-center gap-4">
								<span className="w-8 text-xs text-text-muted">{size}</span>
								{buttonVariants
									.filter((v) => v !== "link")
									.map((variant) => (
										<Button key={`${size}-${variant}`} variant={variant} size={size}>
											{variant}
										</Button>
									))}
							</div>
						))}
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Icon size</h3>
						<div className="flex items-center gap-4">
							<Button variant="primary" size="icon" aria-label="Check">
								&#10003;
							</Button>
							<Button variant="secondary" size="icon" aria-label="Close">
								&#10005;
							</Button>
							<Button variant="outline" size="icon" aria-label="Plus">
								&#43;
							</Button>
							<Button variant="ghost" size="icon" aria-label="Menu">
								&#9776;
							</Button>
							<Button variant="destructive" size="icon" aria-label="Delete">
								&#128465;
							</Button>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Disabled</h3>
						<div className="flex flex-wrap items-center gap-4">
							{buttonVariants.map((variant) => (
								<Button key={`disabled-${variant}`} variant={variant} disabled>
									{variant}
								</Button>
							))}
						</div>
					</div>
				</section>

				{/* ── Badge ───────────────────────────────────────────── */}
				<section className="space-y-10">
					<h2 className="border-b border-border-primary pb-2 font-mono text-xl font-semibold text-text-primary">
						Badge
					</h2>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Composed variants</h3>
						<div className="flex flex-wrap items-center gap-6">
							<Badge variant="critical">
								<BadgeDot />
								<BadgeLabel>critical</BadgeLabel>
							</Badge>
							<Badge variant="warning">
								<BadgeDot />
								<BadgeLabel>warning</BadgeLabel>
							</Badge>
							<Badge variant="good">
								<BadgeDot />
								<BadgeLabel>good</BadgeLabel>
							</Badge>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Custom content</h3>
						<div className="flex flex-wrap items-center gap-6">
							<Badge variant="critical">
								<BadgeDot />
								<BadgeLabel>needs_serious_help</BadgeLabel>
							</Badge>
							<Badge variant="warning">
								<BadgeDot />
								<BadgeLabel>could_be_better</BadgeLabel>
							</Badge>
							<Badge variant="good">
								<BadgeDot />
								<BadgeLabel>production_ready</BadgeLabel>
							</Badge>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Label only (no dot)</h3>
						<div className="flex flex-wrap items-center gap-6">
							<Badge variant="critical">
								<BadgeLabel>critical</BadgeLabel>
							</Badge>
							<Badge variant="warning">
								<BadgeLabel>warning</BadgeLabel>
							</Badge>
							<Badge variant="good">
								<BadgeLabel>good</BadgeLabel>
							</Badge>
						</div>
					</div>
				</section>

				{/* ── Toggle ──────────────────────────────────────────── */}
				<section className="space-y-10">
					<h2 className="border-b border-border-primary pb-2 font-mono text-xl font-semibold text-text-primary">
						Toggle
					</h2>
					<ToggleDemo />
				</section>

				{/* ── DiffLine ────────────────────────────────────────── */}
				<section className="space-y-10">
					<h2 className="border-b border-border-primary pb-2 font-mono text-xl font-semibold text-text-primary">
						DiffLine
					</h2>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Composed variants</h3>
						<div className="max-w-xl overflow-hidden rounded border border-border-primary">
							<DiffLine variant="removed">
								<DiffLinePrefix />
								<DiffLineCode>{"var total = 0;"}</DiffLineCode>
							</DiffLine>
							<DiffLine variant="added">
								<DiffLinePrefix />
								<DiffLineCode>{"const total = 0;"}</DiffLineCode>
							</DiffLine>
							<DiffLine variant="context">
								<DiffLinePrefix />
								<DiffLineCode>{"for (let i = 0; i < items.length; i++) {"}</DiffLineCode>
							</DiffLine>
						</div>
					</div>
				</section>

				{/* ── CodeBlock ───────────────────────────────────────── */}
				<section className="space-y-10">
					<h2 className="border-b border-border-primary pb-2 font-mono text-xl font-semibold text-text-primary">
						CodeBlock
					</h2>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">With filename</h3>
						<div className="max-w-xl">
							<CodeBlock code={sampleCode} language="javascript" filename="calculate.js" />
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Without filename</h3>
						<div className="max-w-xl">
							<CodeBlock
								code={`const greeting = "Hello, world!";\nconsole.log(greeting);`}
								language="javascript"
							/>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">TypeScript</h3>
						<div className="max-w-xl">
							<CodeBlock
								code={`interface User {\n  id: string;\n  name: string;\n  score: number;\n}\n\nfunction roast(user: User): string {\n  return \`Your score is \${user.score}/10\`;\n}`}
								language="typescript"
								filename="roast.ts"
							/>
						</div>
					</div>
				</section>

				{/* ── ScoreRing ───────────────────────────────────────── */}
				<section className="space-y-10">
					<h2 className="border-b border-border-primary pb-2 font-mono text-xl font-semibold text-text-primary">
						ScoreRing
					</h2>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Score values</h3>
						<div className="flex flex-wrap items-center gap-8">
							<ScoreRing score={2.1} size="sm" />
							<ScoreRing score={3.5} />
							<ScoreRing score={5.5} />
							<ScoreRing score={8.2} />
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-sm font-medium text-text-secondary">Sizes</h3>
						<div className="flex flex-wrap items-end gap-8">
							<div className="text-center">
								<ScoreRing score={7.0} size="sm" />
								<p className="mt-2 text-xs text-text-muted">sm</p>
							</div>
							<div className="text-center">
								<ScoreRing score={7.0} size="md" />
								<p className="mt-2 text-xs text-text-muted">md</p>
							</div>
							<div className="text-center">
								<ScoreRing score={7.0} size="lg" />
								<p className="mt-2 text-xs text-text-muted">lg</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
