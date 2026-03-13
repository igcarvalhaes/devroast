"use client";

import { Switch } from "@base-ui/react/switch";
import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const toggle = tv({
	base: "",
	variants: {
		size: {
			md: "",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

type ToggleVariants = VariantProps<typeof toggle>;

type ToggleProps = Omit<ComponentProps<typeof Switch.Root>, "className"> &
	ToggleVariants & {
		className?: string;
	};

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({ className, size, ...props }, ref) => {
	return (
		<Switch.Root
			ref={ref}
			className={toggle({
				size,
				className: [
					"group inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full p-[3px]",
					"bg-border-primary data-[checked]:bg-accent-green",
					"transition-colors duration-200",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
					"disabled:cursor-not-allowed disabled:opacity-50",
					className,
				].join(" "),
			})}
			{...props}
		>
			<Switch.Thumb
				className={[
					"block size-4 rounded-full transition-transform duration-200",
					"bg-text-secondary group-data-[checked]:bg-bg-page",
					"translate-x-0 group-data-[checked]:translate-x-[18px]",
				].join(" ")}
			/>
		</Switch.Root>
	);
});

Toggle.displayName = "Toggle";

export { Toggle, toggle, type ToggleProps, type ToggleVariants };
