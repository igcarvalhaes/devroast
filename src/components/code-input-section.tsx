"use client";

import { useState } from "react";
import { ActionsBar } from "@/components/actions-bar";
import { CodeEditor } from "@/components/code-editor";

function CodeInputSection() {
	const [code, setCode] = useState("");

	return (
		<>
			<CodeEditor value={code} onValueChange={setCode} />
			<ActionsBar submitDisabled={code.trim().length === 0} />
		</>
	);
}

CodeInputSection.displayName = "CodeInputSection";

export { CodeInputSection };
