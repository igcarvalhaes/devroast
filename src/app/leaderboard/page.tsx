import type { Metadata } from "next";
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
	code: string;
}

// Dados estáticos de exemplo
const leaderboardData: LeaderboardData[] = [
	{
		rank: 1,
		score: 1.2,
		language: "javascript",
		lineCount: 3,
		code: `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
	},
	{
		rank: 2,
		score: 1.8,
		language: "python",
		lineCount: 4,
		code: `def secure_password():
    return "123456"

# TODO: make it more secure later`,
	},
	{
		rank: 3,
		score: 2.3,
		language: "typescript",
		lineCount: 3,
		code: `const isProduction = true;
if (isProduction) console.log(error);
// errors are features`,
	},
	{
		rank: 4,
		score: 2.9,
		language: "java",
		lineCount: 5,
		code: `public void processData() {
    try {
        // TODO: implement this
    } catch (Exception e) {}
}`,
	},
	{
		rank: 5,
		score: 3.4,
		language: "php",
		lineCount: 2,
		code: `$password = $_GET['pwd'];
mysqli_query("SELECT * FROM users WHERE pass=$password");`,
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
						{"// the most roasted code on the internet"}
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
