"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { Button, button } from "./button";

type PaginationProps = ComponentProps<"div"> & {
	currentPage: number;
	totalPages: number;
};

export function Pagination({ currentPage, totalPages, className, ...props }: PaginationProps) {
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
		<div
			className={`flex items-center gap-2 font-mono text-sm text-text-primary ${className ?? ""}`}
			{...props}
		>
			{isFirstPage ? (
				<Button variant="outline" size="sm" disabled>
					Previous
				</Button>
			) : (
				<Link
					href={createPageUrl(currentPage - 1)}
					className={button({ variant: "outline", size: "sm" })}
				>
					Previous
				</Link>
			)}

			<span>
				Page {currentPage} of {totalPages}
			</span>

			{isLastPage ? (
				<Button variant="outline" size="sm" disabled>
					Next
				</Button>
			) : (
				<Link
					href={createPageUrl(currentPage + 1)}
					className={button({ variant: "outline", size: "sm" })}
				>
					Next
				</Link>
			)}
		</div>
	);
}
