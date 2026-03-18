import Link from "next/link";
import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const navbar = tv({
	base: [
		"flex items-center justify-between w-full h-14",
		"px-10 bg-bg-page",
		"border-b border-border-primary",
	],
});

type NavbarVariants = VariantProps<typeof navbar>;

type NavbarProps = ComponentProps<"nav"> & NavbarVariants;

const Navbar = forwardRef<HTMLElement, NavbarProps>(({ className, ...props }, ref) => {
	return (
		<nav ref={ref} className={navbar({ className })} {...props}>
			<Link href="/" className="flex items-center gap-2">
				<span className="font-mono text-xl font-bold text-accent-green">{">"}</span>
				<span className="font-mono text-lg font-medium text-text-primary">devroast</span>
			</Link>

			<div className="flex items-center gap-6">
				<Link
					href="/leaderboard"
					className="font-mono text-[13px] text-text-secondary transition-colors hover:text-text-primary"
				>
					leaderboard
				</Link>
			</div>
		</nav>
	);
});

Navbar.displayName = "Navbar";

export { Navbar, navbar, type NavbarProps, type NavbarVariants };
