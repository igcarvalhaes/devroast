import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
	variable: "--font-body-mono",
	subsets: ["latin"],
	weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
	title: "devroast",
	description: "Paste your code. Get roasted.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${jetbrainsMono.variable} ${ibmPlexMono.variable} antialiased`}>
				<TRPCReactProvider>
					<Navbar />
					{children}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
