import type { Metadata } from "next";
import type { CodeLine } from "@/components/leaderboard-code-block";
import { LeaderboardEntry } from "@/components/leaderboard-entry";

export const metadata: Metadata = {
	title: "Shame Leaderboard | devroast",
	description: "The most roasted code on the internet",
};

interface LeaderboardData {
	rank: number;
	score: number;
	language: string;
	lineCount: number;
	code: CodeLine[];
}

// Dados estáticos de exemplo
const leaderboardData: LeaderboardData[] = [
	{
		rank: 1,
		score: 1.2,
		language: "javascript",
		lineCount: 3,
		code: [
			{
				tokens: [
					{ content: "eval", color: "#61AFEF" },
					{ content: "(", color: "#ABB2BF" },
					{ content: "prompt", color: "#61AFEF" },
					{ content: "(", color: "#ABB2BF" },
					{ content: '"enter code"', color: "#E5C07B" },
					{ content: "))", color: "#ABB2BF" },
				],
			},
			{
				tokens: [
					{ content: "document", color: "#E06C75" },
					{ content: ".write", color: "#61AFEF" },
					{ content: "(", color: "#ABB2BF" },
					{ content: "response", color: "#E06C75" },
					{ content: ")", color: "#ABB2BF" },
				],
			},
			{
				tokens: [{ content: "// trust the user lol", color: "#8B8B8B" }],
			},
		],
	},
	{
		rank: 2,
		score: 1.8,
		language: "python",
		lineCount: 4,
		code: [
			{
				tokens: [
					{ content: "def ", color: "#C678DD" },
					{ content: "secure_password", color: "#61AFEF" },
					{ content: "():", color: "#ABB2BF" },
				],
			},
			{
				tokens: [
					{ content: "    ", color: "#ABB2BF" },
					{ content: "return ", color: "#C678DD" },
					{ content: '"123456"', color: "#E5C07B" },
				],
			},
			{
				tokens: [{ content: "", color: "#ABB2BF" }],
			},
			{
				tokens: [{ content: "# TODO: make it more secure later", color: "#8B8B8B" }],
			},
		],
	},
	{
		rank: 3,
		score: 2.3,
		language: "typescript",
		lineCount: 3,
		code: [
			{
				tokens: [
					{ content: "const ", color: "#C678DD" },
					{ content: "isProduction ", color: "#E06C75" },
					{ content: "= ", color: "#ABB2BF" },
					{ content: "true", color: "#D19A66" },
					{ content: ";", color: "#ABB2BF" },
				],
			},
			{
				tokens: [
					{ content: "if ", color: "#C678DD" },
					{ content: "(", color: "#ABB2BF" },
					{ content: "isProduction", color: "#E06C75" },
					{ content: ") ", color: "#ABB2BF" },
					{ content: "console", color: "#E06C75" },
					{ content: ".log", color: "#61AFEF" },
					{ content: "(", color: "#ABB2BF" },
					{ content: "error", color: "#E06C75" },
					{ content: ");", color: "#ABB2BF" },
				],
			},
			{
				tokens: [{ content: "// errors are features", color: "#8B8B8B" }],
			},
		],
	},
	{
		rank: 4,
		score: 2.9,
		language: "java",
		lineCount: 5,
		code: [
			{
				tokens: [
					{ content: "public ", color: "#C678DD" },
					{ content: "void ", color: "#C678DD" },
					{ content: "processData", color: "#61AFEF" },
					{ content: "() {", color: "#ABB2BF" },
				],
			},
			{
				tokens: [
					{ content: "    ", color: "#ABB2BF" },
					{ content: "try ", color: "#C678DD" },
					{ content: "{", color: "#ABB2BF" },
				],
			},
			{
				tokens: [
					{ content: "        ", color: "#ABB2BF" },
					{ content: "// TODO: implement this", color: "#8B8B8B" },
				],
			},
			{
				tokens: [
					{ content: "    ", color: "#ABB2BF" },
					{ content: "} ", color: "#ABB2BF" },
					{ content: "catch ", color: "#C678DD" },
					{ content: "(", color: "#ABB2BF" },
					{ content: "Exception ", color: "#E5C07B" },
					{ content: "e) {}", color: "#ABB2BF" },
				],
			},
			{
				tokens: [{ content: "}", color: "#ABB2BF" }],
			},
		],
	},
	{
		rank: 5,
		score: 3.4,
		language: "php",
		lineCount: 2,
		code: [
			{
				tokens: [
					{ content: "$password ", color: "#E06C75" },
					{ content: "= ", color: "#ABB2BF" },
					{ content: "$_GET", color: "#E06C75" },
					{ content: "[", color: "#ABB2BF" },
					{ content: "'pwd'", color: "#E5C07B" },
					{ content: "];", color: "#ABB2BF" },
				],
			},
			{
				tokens: [
					{ content: "mysqli_query", color: "#61AFEF" },
					{ content: "(", color: "#ABB2BF" },
					{ content: '"SELECT * FROM users WHERE pass=$password"', color: "#E5C07B" },
					{ content: ");", color: "#ABB2BF" },
				],
			},
		],
	},
];

export default function LeaderboardPage() {
	return (
		<main className="flex flex-col w-full bg-bg-page px-20 py-10">
			<div className="flex flex-col w-full gap-10">
				{/* Hero Section */}
				<div className="flex flex-col gap-4 w-full">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[32px] font-bold text-accent-green">{">"}</span>
						<h1 className="font-mono text-[28px] font-bold text-text-primary">shame_leaderboard</h1>
					</div>

					<p className="font-body-mono text-sm text-text-secondary">
						// the most roasted code on the internet
					</p>

					<div className="flex items-center gap-2">
						<span className="font-body-mono text-xs text-text-tertiary">2,847 submissions</span>
						<span className="font-body-mono text-xs text-text-tertiary">·</span>
						<span className="font-body-mono text-xs text-text-tertiary">avg score: 4.2/10</span>
					</div>
				</div>

				{/* Leaderboard Entries */}
				<div className="flex flex-col gap-5 w-full">
					{leaderboardData.map((entry) => (
						<LeaderboardEntry
							key={entry.rank}
							rank={entry.rank}
							score={entry.score}
							language={entry.language}
							lineCount={entry.lineCount}
							code={entry.code}
						/>
					))}
				</div>
			</div>
		</main>
	);
}
