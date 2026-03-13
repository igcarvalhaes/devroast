"use client";

import { type ComponentProps, forwardRef, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const actionsBar = tv({
	base: "flex items-center justify-between w-[780px]",
});

type ActionsBarVariants = VariantProps<typeof actionsBar>;

type ActionsBarProps = ComponentProps<"div"> &
	ActionsBarVariants & {
		submitDisabled?: boolean;
	};

const ActionsBar = forwardRef<HTMLDivElement, ActionsBarProps>(
	({ className, submitDisabled, ...props }, ref) => {
		const [roastMode, setRoastMode] = useState(true);

		return (
			<div ref={ref} className={actionsBar({ className })} {...props}>
				{/* Left side: toggle + hint */}
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2.5">
						<Toggle checked={roastMode} onCheckedChange={setRoastMode} />
						<span className="font-mono text-[13px] text-accent-green">roast mode</span>
					</div>
					<span className="font-body-mono text-xs text-text-tertiary">
						{"// maximum sarcasm enabled"}
					</span>
				</div>

				{/* Right side: submit button */}
				<Button
					type="button"
					variant="primary"
					size="md"
					disabled={submitDisabled}
					className="rounded-none px-6 py-2.5 text-[13px]"
				>
					$ roast_my_code
				</Button>
			</div>
		);
	},
);

ActionsBar.displayName = "ActionsBar";

export { ActionsBar, actionsBar, type ActionsBarProps, type ActionsBarVariants };
