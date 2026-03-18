"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Button, button } from "./button";

const pagination = tv({
	base: "flex items-center gap-2 font-mono text-sm text-text-primary",
});

type PaginationVariants = VariantProps<typeof pagination>;

type PaginationProps = ComponentProps<"div"> &
	PaginationVariants & {
		currentPage: number;
		totalPages: number;
	};

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
	({ currentPage, totalPages, className, ...props }, ref) => {
		const pathname = usePathname();
		const searchParams = useSearchParams();

		const createPageUrl = (pageNumber: number) => {
			const params = new URLSearchParams(searchParams?.toString());
			params.set("page", pageNumber.toString());
			return `${pathname}?${params.toString()}`;
		};

		const isFirstPage = currentPage <= 1;
		const isLastPage = currentPage >= totalPages;

		return (
			<div ref={ref} className={pagination({ className })} {...props}>
				{isFirstPage ? (
					<Button variant="outline" size="sm" disabled aria-label="Previous page">
						Previous
					</Button>
				) : (
					<Link
						href={createPageUrl(currentPage - 1)}
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
						href={createPageUrl(currentPage + 1)}
						className={button({ variant: "outline", size: "sm" })}
						aria-label="Next page"
					>
						Next
					</Link>
				)}
			</div>
		);
	},
);

Pagination.displayName = "Pagination";

export { Pagination, pagination, type PaginationProps };
