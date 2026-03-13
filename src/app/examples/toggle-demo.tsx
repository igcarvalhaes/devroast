"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";

function ToggleDemo() {
	const [roastMode, setRoastMode] = useState(false);

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-medium text-text-secondary">States</h3>
			<div className="flex items-center gap-8">
				<div className="flex items-center gap-3 font-mono text-xs">
					<Toggle checked={roastMode} onCheckedChange={setRoastMode} aria-label="roast mode" />
					<span className={roastMode ? "text-accent-green" : "text-text-secondary"}>
						roast mode
					</span>
				</div>

				<div className="flex items-center gap-3 font-mono text-xs">
					<Toggle checked={false} disabled aria-label="disabled off" />
					<span className="text-text-secondary">disabled off</span>
				</div>

				<div className="flex items-center gap-3 font-mono text-xs">
					<Toggle checked disabled aria-label="disabled on" />
					<span className="text-text-secondary">disabled on</span>
				</div>
			</div>
		</div>
	);
}

export { ToggleDemo };
