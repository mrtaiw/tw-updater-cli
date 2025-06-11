#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { login, isLoggedIn, getToken } from "./lib/auth";
import { uploadFile } from "./lib/upload";
import { generateRelease } from "./lib/release";
import * as fs from "fs";

program
	.name("tw-updater-cli")
	.description("A simple CLI tool with login and update")
	.version(require("../package.json").version);

program
	.command("login")
	.option("-p, --profile <profile>", "Profile name", "default")
	.description("Login to the system")
	.action(async ({ profile }) => {
		try {
			const result = await login(profile);
			if (result) {
				console.log(chalk.green("✓ Login successful!"));
			} else {
				console.log(chalk.red("✗ Login failed. Please try again."));
			}
		} catch (error: any) {
			console.error(chalk.red("Error during login:"), error.message);
		}
	});

program
	.command("update")
	.description("Upload bundle to the server")
	.option("-p, --platform <platform>", "Platform to upload", "all")
	.option("-n, --note <note>", "Changelog", "")
	.option("-a, --account <account>", "Profile", "default")
	.option("-v, --verbose", "Enable verbose logging")
	.option("-k, --keep", "Keep bundle after upload")
	.action(async ({ platform, note, verbose, account, keep }) => {
		console.log(chalk.blue("Using profile:"), chalk.yellow(account));

		if (!isLoggedIn(account)) {
			console.log(
				chalk.red("You need to login first. Use the login command.")
			);
			return;
		}

		let spinner: any = null;
		if (!verbose) {
			spinner = ora("Generating bundle...").start();
		} else {
			console.log("Generating bundle...");
		}
		const release = await generateRelease(platform, verbose);
		if (spinner) {
			spinner.stop();
		}
		console.log(chalk.greenBright(`✓ Bundle generated: ${release.bundle}`));

		const uploadSpinner = ora("Uploading file...").start();
		try {
			const result = await uploadFile(
				{
					...release,
					note,
				},
				getToken(account)
			);
			uploadSpinner.stop();
			if (result) {
				console.log(
					chalk.greenBright(
						`✓ ${result.message || "File uploaded successfully!"}`
					)
				);

				if (!keep && fs.existsSync(release.bundle)) {
					fs.unlinkSync(release.bundle);
				}
			} else {
				console.log(chalk.red("✗ File upload failed."));
			}
		} catch (error: any) {
			uploadSpinner.stop();
			console.error(chalk.red("Error during upload:"), error.message);
			if (fs.existsSync(release.bundle)) {
				fs.unlinkSync(release.bundle);
			}
		}
	});

program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
	program.outputHelp();
}
