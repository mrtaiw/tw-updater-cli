import inquirer from "inquirer";
import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";

// Store auth token in a hidden file in user's home directory
const TOKEN_FILE = path.join(os.homedir(), ".tw-updater-cli-");
let currentToken: string = "";

// Check if the user is already logged in
export const isLoggedIn = (profile: string = "default"): boolean => {
	if (currentToken) return true;

	try {
		if (fs.existsSync(TOKEN_FILE + profile)) {
			currentToken = fs.readFileSync(TOKEN_FILE + profile, "utf8").trim();
			return !!currentToken;
		}
	} catch (error: any) {
		console.error("Error reading token file:", error.message);
	}
	return false;
};

// Get stored token
export const getToken = (profile: string = "default"): string => {
	if (!currentToken && fs.existsSync(TOKEN_FILE + profile)) {
		currentToken = fs.readFileSync(TOKEN_FILE + profile, "utf8").trim();
	}
	return currentToken;
};

// Login function
export const login = async (profile: string = "default"): Promise<boolean> => {
	dotenv.config({ path: path.resolve(process.cwd(), ".env") });
	// Prompt for credentials
	const credentials = await inquirer.prompt([
		{
			type: "input",
			name: "email",
			message: "Enter your email:",
			validate: (input) =>
				input.length > 0 ? true : "Email is required",
		},
		{
			type: "password",
			name: "password",
			message: "Enter your password:",
			mask: "*",
			validate: (input) =>
				input.length > 0 ? true : "Password is required",
		},
	]);

	try {
		const domain = process.env.TW_UPDATER_URL || "https://u.mrtaiw.dev";

		const response = await axios.post(domain + "/api/login", {
			email: credentials.email,
			password: credentials.password,
		});

		if (response.data && response.data.token) {
			// Store the token
			currentToken = response.data.token;
			fs.writeFileSync(TOKEN_FILE + profile, currentToken);
			return true;
		}

		return false;
	} catch (error: any) {
		console.error("Login error:", error);
		return false;
	}
};

// Logout function
export const logout = (profile: string = "default"): boolean => {
	currentToken = "";
	if (fs.existsSync(TOKEN_FILE + profile)) {
		fs.unlinkSync(TOKEN_FILE + profile);
	}
	return true;
};
