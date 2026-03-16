import { DiffBlock } from "@/components/diff-block";
import { IssueCard } from "@/components/issue-card";
import { Badge, BadgeDot, BadgeLabel } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ScoreRing } from "@/components/ui/score-ring";

interface RoastPageProps {
	params: Promise<{ id: string }>;
}

type IssueType = "error" | "warning" | "success";
type BadgeVariant = "critical" | "warning" | "good";

// Dados estáticos temporários
const MOCK_ROAST_DATA = {
	score: 3.5,
	verdict: "critical" as BadgeVariant,
	roastMessage: '"this code looks like it was written during a power outage... in 2005."',
	language: "javascript",
	lineCount: 7,
	code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`,
	issues: [
		{
			id: "issue-1",
			type: "error" as IssueType,
			title: "using var instead of const/let",
			description:
				"var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
		},
		{
			id: "issue-2",
			type: "warning" as IssueType,
			title: "imperative loop pattern",
			description:
				"for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
		},
		{
			id: "issue-3",
			type: "success" as IssueType,
			title: "clear naming conventions",
			description:
				"calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
		},
		{
			id: "issue-4",
			type: "success" as IssueType,
			title: "single responsibility",
			description:
				"the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
		},
	],
	diff: {
		fileName: "your_code.ts → improved_code.ts",
		removed: [
			"  var total = 0;",
			"  for (var i = 0; i < items.length; i++) {",
			"    total = total + items[i].price;",
			"  }",
			"  return total;",
		],
		added: ["  return items.reduce((sum, item) => sum + item.price, 0);"],
	},
};

export default async function RoastPage({ params }: RoastPageProps) {
	// ID do roast da URL (por enquanto não usado, mas será útil quando conectar com API)
	await params;

	return (
		<main className="min-h-screen bg-bg-page">
			<div className="mx-auto max-w-6xl space-y-10 px-20 py-10">
				{/* Score Hero */}
				<section className="flex items-center gap-12">
					<ScoreRing score={MOCK_ROAST_DATA.score} />

					<div className="flex-1 space-y-4">
						<Badge variant={MOCK_ROAST_DATA.verdict}>
							<BadgeDot />
							<BadgeLabel>verdict: {MOCK_ROAST_DATA.verdict}</BadgeLabel>
						</Badge>

						<p className="font-body-mono text-xl leading-relaxed text-text-primary">
							{MOCK_ROAST_DATA.roastMessage}
						</p>

						<div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
							<span>lang: {MOCK_ROAST_DATA.language}</span>
							<span>·</span>
							<span>{MOCK_ROAST_DATA.lineCount} lines</span>
						</div>

						<div className="flex items-center gap-3">
							<button
								type="button"
								className="border border-border-primary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:bg-bg-surface"
							>
								$ share_roast
							</button>
						</div>
					</div>
				</section>

				<div className="h-px bg-border-primary" />

				{/* Submitted Code Section */}
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
						<h2 className="font-mono text-sm font-bold text-text-primary">your_submission</h2>
					</div>

					<CodeBlock code={MOCK_ROAST_DATA.code} language="javascript" />
				</section>

				<div className="h-px bg-border-primary" />

				{/* Analysis Section */}
				<section className="space-y-6">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
						<h2 className="font-mono text-sm font-bold text-text-primary">detailed_analysis</h2>
					</div>

					<div className="grid grid-cols-2 gap-5">
						{MOCK_ROAST_DATA.issues.map((issue) => (
							<IssueCard
								key={issue.id}
								type={issue.type}
								title={issue.title}
								description={issue.description}
							/>
						))}
					</div>
				</section>

				<div className="h-px bg-border-primary" />

				{/* Diff Section */}
				<section className="space-y-6">
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
						<h2 className="font-mono text-sm font-bold text-text-primary">suggested_fix</h2>
					</div>

					<DiffBlock
						fileName={MOCK_ROAST_DATA.diff.fileName}
						removed={MOCK_ROAST_DATA.diff.removed}
						added={MOCK_ROAST_DATA.diff.added}
					/>
				</section>
			</div>
		</main>
	);
}
