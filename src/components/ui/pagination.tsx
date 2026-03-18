"use client";

import Link from "next/link";
import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Button, button } from "./button";

const pagination = tv({
	base: "flex items-center gap-2 font-mono text-sm text-text-primary",
});

type PaginationVariants = VariantProps<typeof pagination>;

type PaginationProps = ComponentProps<"nav"> &
	PaginationVariants & {
		currentPage: number;
		totalPages: number;
		buildHref: (page: number) => string;
	};

const Pagination = forwardRef<HTMLElement, PaginationProps>(
	({ currentPage, totalPages, buildHref, className, ...props }, ref) => {
		const isFirstPage = currentPage <= 1;
		const isLastPage = currentPage >= totalPages;

		return (
			<nav ref={ref} className={pagination({ className })} aria-label="pagination" {...props}>
				{isFirstPage ? (
					<Button variant="outline" size="sm" disabled aria-label="Previous page">
						Previous
					</Button>
				) : (
					<Link
						href={buildHref(currentPage - 1)}
						className={button({ variant: "outline", size: "sm" })}
						aria-label="Previous page"
					>
						Previous
					</Link>
				)}

				<span>
					Page {currentPage} of {totalPages}
				</span>

				{isLastPage ? (
					<Button variant="outline" size="sm" disabled aria-label="Next page">
						Next
					</Button>
				) : (
					<Link
						href={buildHref(currentPage + 1)}
						className={button({ variant: "outline", size: "sm" })}
						aria-label="Next page"
					>
						Next
					</Link>
				)}
			</nav>
		);
	},
);

Pagination.displayName = "Pagination";

export { Pagination, pagination, type PaginationProps };
