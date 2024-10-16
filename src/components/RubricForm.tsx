"use client";

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const RubricForm: React.FC = () => {
	const [textInput, setTextInput] = useState("");
	const [rubricInput, setRubricInput] = useState("");
	const [gradeLevel, setGradeLevel] = useState("9th");
	const [classLevel, setClassLevel] = useState("Honors");
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults(null);

		try {
			const apiKey = process.env.NEXT_PUBLIC_GCP_AI_API_KEY;
			if (!apiKey) {
				throw new Error(
					"Google API key is not defined. Please check your environment variables."
				);
			}

			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({
				model: "gemini-1.5-flash",
			});

			const prompt = `
                You are an AI that summarizes rubric assessments. The rubric categories are: ${rubricInput}. The text to assess is: ${textInput}. The grade level is ${gradeLevel} and the class level is ${classLevel}.
                
                Please provide a summary of each category following this exact format:
                
                Category: [Category Name]
                Score: [Score/Total Points] (e.g., 28/30 or N/A if not applicable)
                Summary: [Provide a brief summary of the evaluation for this category]
                Tips for Improvement: [Specific tips for improvement or N/A]

                Ensure that each category summary is separated by "###" to clearly distinguish between different categories. Do not include any empty categories or placeholders.`;

			const result = await model.generateContent(prompt);

			if (result?.response?.text()) {
				setResults(result.response.text());
			} else {
				setError("The AI returned an unexpected response.");
			}
		} catch (err) {
			console.error(err);
			setError("An error occurred while processing your request.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-4">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Rubric Assessment Form</CardTitle>
					<CardDescription>
						Enter the essay text and rubric categories to generate
						an assessment.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Text Input */}
						<div>
							<label
								htmlFor="textInput"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Text Input
							</label>
							<Textarea
								id="textInput"
								value={textInput}
								onChange={(e) => setTextInput(e.target.value)}
								required
								placeholder="Enter the essay text here..."
								className="w-full"
								rows={6}
								disabled={loading} // Disable while loading
							/>
						</div>

						{/* Rubric Categories */}
						<div>
							<label
								htmlFor="rubricInput"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Rubric Categories
							</label>
							<Textarea
								id="rubricInput"
								value={rubricInput}
								onChange={(e) => setRubricInput(e.target.value)}
								required
								placeholder="List the rubric categories separated by commas..."
								className="w-full"
								rows={4}
								disabled={loading} // Disable while loading
							/>
						</div>

						{/* Grade Level */}
						<div>
							<label
								htmlFor="gradeLevel"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Grade Level
							</label>
							<select
								id="gradeLevel"
								value={gradeLevel}
								onChange={(e) => setGradeLevel(e.target.value)}
								className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
								disabled={loading} // Disable while loading
							>
								{[
									"6th",
									"7th",
									"8th",
									"9th",
									"10th",
									"11th",
									"12th",
									"College",
								].map((level) => (
									<option key={level} value={level}>
										{level}
									</option>
								))}
							</select>
						</div>

						{/* Class Level */}
						<div>
							<label
								htmlFor="classLevel"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Class Level
							</label>
							<select
								id="classLevel"
								value={classLevel}
								onChange={(e) => setClassLevel(e.target.value)}
								className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
								disabled={loading} // Disable while loading
							>
								{["Low", "Normal", "Honors", "AP"].map(
									(level) => (
										<option key={level} value={level}>
											{level}
										</option>
									)
								)}
							</select>
						</div>

						{/* Submit Button */}
						<div className="flex justify-center">
							<Button type="submit" disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									"Submit"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
			{/* Error Message */}
			{error && (
				<Card className="mb-6 border-red-500 bg-red-50">
					<CardContent>
						<p className="text-red-600">{error}</p>
					</CardContent>
				</Card>
			)}
			{/* Results */}
			{results &&
				(() => {
					let totalScore = 0;
					let totalPossibleScore = 0;
					let allTips: string[] = [];

					const cards = results.split("###").map((result, index) => {
						// Extracting each section using regex to match the required pattern
						const match = result.match(
							/Category:\s*([\s\S]*?)\s*Score:\s*([\s\S]*?)\s*Summary:\s*([\s\S]*?)\s*Tips for Improvement:\s*([\s\S]*)/i
						);

						// Skip if no valid match is found to avoid "ghost" categories
						if (!match || !match[1].trim()) {
							return null;
						}

						const category = match?.[1] ?? `Category ${index + 1}`;
						const score = match?.[2] ?? "N/A";
						const summary = match?.[3] ?? "";
						const tips = match?.[4] ?? "N/A";

						// Parse the score and update totals
						if (score !== "N/A") {
							const scoreParts = score.split("/");
							if (scoreParts.length === 2) {
								const givenScore = parseFloat(scoreParts[0]);
								const possibleScore = parseFloat(scoreParts[1]);
								if (
									!isNaN(givenScore) &&
									!isNaN(possibleScore)
								) {
									totalScore += givenScore;
									totalPossibleScore += possibleScore;
								}
							}
						}

						// Collect tips
						if (tips && tips.trim() !== "N/A") {
							allTips.push(tips.trim());
						}

						return (
							<Card key={index}>
								<CardHeader>
									<CardTitle>{category}</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										<strong>Score:</strong> {score}
									</p>
									<p>
										<strong>Summary:</strong> {summary}
									</p>
									<p>
										<strong>Tips for Improvement:</strong>{" "}
										{tips}
									</p>
								</CardContent>
							</Card>
						);
					});

					// Calculate percentage and letter grade
					let percentage = 0;
					let letterGrade = "N/A";
					if (totalPossibleScore > 0) {
						percentage = (totalScore / totalPossibleScore) * 100;

						// Determine letter grade
						if (percentage >= 97) {
							letterGrade = "A+";
						} else if (percentage >= 93) {
							letterGrade = "A";
						} else if (percentage >= 90) {
							letterGrade = "A-";
						} else if (percentage >= 87) {
							letterGrade = "B+";
						} else if (percentage >= 83) {
							letterGrade = "B";
						} else if (percentage >= 80) {
							letterGrade = "B-";
						} else if (percentage >= 77) {
							letterGrade = "C+";
						} else if (percentage >= 73) {
							letterGrade = "C";
						} else if (percentage >= 70) {
							letterGrade = "C-";
						} else if (percentage >= 67) {
							letterGrade = "D+";
						} else if (percentage >= 63) {
							letterGrade = "D";
						} else if (percentage >= 60) {
							letterGrade = "D-";
						} else {
							letterGrade = "F";
						}
					}

					return (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{cards}
							</div>
							{totalPossibleScore > 0 && (
								<Card className="mt-6">
									<CardHeader>
										<CardTitle>Final Score</CardTitle>
									</CardHeader>
									<CardContent>
										<p>
											<strong>Combined Score:</strong>{" "}
											{totalScore}/{totalPossibleScore}
										</p>
										<p>
											<strong>Percentage:</strong>{" "}
											{percentage.toFixed(2)}%
										</p>
										<p>
											<strong>Letter Grade:</strong>{" "}
											{letterGrade}
										</p>
									</CardContent>
								</Card>
							)}
						</>
					);
				})()}
		</div>
	);
};

export default RubricForm;
