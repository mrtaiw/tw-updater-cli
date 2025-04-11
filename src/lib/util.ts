import { exec } from "child_process";

const fs = require("fs");
const archiver = require("archiver");

export const compress = (
	destination: string,
	directory: string | null,
	files?: string | string[]
) => {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(destination);
		const archive = archiver("zip");

		output.on("close", function () {
			resolve(true);
		});

		archive.on("error", function (err: any) {
			reject(err.message);
		});

		archive.pipe(output);

		if (directory) {
			archive.directory(directory, false);
		}

		if (files) {
			if (!Array.isArray(files)) {
				archive.file(files, { name: files.split("/").pop() });
			} else {
				files.forEach((file: string) => {
					const name = file.endsWith(".exe.sig")
						? "tauri.sig"
						: file.split("/").pop();
					archive.file(file, { name });
				});
			}
		}

		archive.finalize();
	});
};

export const getLastFileWithExtension = (
	folderPath: string,
	extension: string
) => {
	const files = fs.readdirSync(folderPath); // read all files in the folder
	const filteredFiles = files.filter((file: string) =>
		file.endsWith(extension)
	); // keep only files that end with the specified extension
	const sortedFiles = filteredFiles.sort((a: string, b: string) => {
		return (
			fs.statSync(folderPath + "\\" + b).mtime.getTime() -
			fs.statSync(folderPath + "\\" + a).mtime.getTime()
		);
	}); // sort by creation/modified time in descending order

	return sortedFiles[0]; // return the name of the last file
};

export const execAsync = (
	command: string,
	verbose: boolean = false
): Promise<string> =>
	new Promise((resolve, reject) => {
		const child = exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(`Error: ${error.message}`);
			} else {
				resolve(stdout.trim());
			}
		});
		if (verbose) {
			child.stdout?.pipe(process.stdout);
			child.stderr?.pipe(process.stderr);
		}
	});
