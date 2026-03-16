"use client";

import { useState } from "react";
import { ActionsBar } from "@/components/actions-bar";
import { CodeEditor } from "@/components/code-editor";

function CodeInputSection() {
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState<string | null>(null);

	return (
		<>
			<CodeEditor
				value={code}
				onValueChange={setCode}
				language={language ?? undefined}
				onLanguageChange={setLanguage}
			/>
			<ActionsBar submitDisabled={code.trim().length === 0} />
		</>
	);
}

CodeInputSection.displayName = "CodeInputSection";

export { CodeInputSection };
