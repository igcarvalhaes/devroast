import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
	base: [
		"inline-flex items-center justify-center gap-2",
		"font-medium text-sm font-mono",
		"transition-colors duration-150",
		"cursor-pointer disabled:pointer-events-none disabled:opacity-50",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-green",
	],
	variants: {
		variant: {
			primary: "bg-accent-green text-bg-page enabled:hover:bg-accent-green-hover",
			secondary: "bg-bg-elevated text-text-primary enabled:hover:bg-bg-elevated-hover",
			outline:
				"border border-border-hover bg-transparent text-text-primary enabled:hover:bg-bg-elevated",
			ghost: "bg-transparent text-text-primary enabled:hover:bg-bg-elevated",
			destructive: "bg-accent-red text-bg-page enabled:hover:bg-accent-red-hover",
			link: "bg-transparent text-accent-green underline-offset-4 enabled:hover:underline p-0 h-auto",
		},
		size: {
			sm: "h-8 px-3 text-xs rounded-md",
			md: "h-10 px-6 text-sm rounded-md",
			lg: "h-12 px-8 text-base rounded-md",
			icon: "h-10 w-10 rounded-md",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ComponentProps<"button"> & ButtonVariants;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return <button ref={ref} className={button({ variant, size, className })} {...props} />;
	},
);

Button.displayName = "Button";

export { Button, button, type ButtonProps, type ButtonVariants };
