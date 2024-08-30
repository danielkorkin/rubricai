import "./globals.css";
import React from "react";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Rubricai",
	description:
		"Rubricai is an AI-driven essay grading platform that offers customizable rubrics, detailed feedback, and automated scoring to enhance accuracy and save time for educators and students",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<div className="min-h-screen flex flex-col">
					<header className="bg-black text-white p-4 flex items-center">
						<Image
							src="/favicon.ico"
							alt="Rubricai Logo"
							width={32}
							height={32}
							className="mr-2"
						/>
						<h1 className="text-xl font-bold">Rubricai</h1>
					</header>
					<main className="flex-1 p-4">{children}</main>
					<footer className="bg-black text-white text-center p-4 mt-auto">
						&copy; {new Date().getFullYear()} Rubricai. All rights
						reserved.
					</footer>
				</div>
			</body>
		</html>
	);
}
