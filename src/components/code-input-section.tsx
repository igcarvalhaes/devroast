"use client";

import { useState } from "react";
import { ActionsBar } from "@/components/actions-bar";
import { CodeEditor, MAX_CODE_LENGTH } from "@/components/code-editor";

function CodeInputSection() {
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState<string | null>(null);

	const isCodeEmpty = code.trim().length === 0;
	const isOverLimit = code.length > MAX_CODE_LENGTH;
	const isSubmitDisabled = isCodeEmpty || isOverLimit;

	return (
		<>
			<CodeEditor
				value={code}
				onValueChange={setCode}
				language={language ?? undefined}
				onLanguageChange={setLanguage}
			/>
			<ActionsBar submitDisabled={isSubmitDisabled} />
		</>
	);
}

CodeInputSection.displayName = "CodeInputSection";

export { CodeInputSection };
