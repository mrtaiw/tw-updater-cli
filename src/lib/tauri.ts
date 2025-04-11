import { Release } from "../types";
import { compress, execAsync, getLastFileWithExtension } from "./util";

const fs = require("fs");

export const getTauriBundle = async (
	verbose: boolean = false
): Promise<Release> => {
	try {
		await execAsync("npx @dotenvx/dotenvx run -- tauri build", verbose);
		const tauri = JSON.parse(
			fs.readFileSync("./src-tauri/tauri.conf.json")
		);

		const folderPath = "./src-tauri/target/release/bundle/nsis/";
		const exeFile = getLastFileWithExtension(
			folderPath,
			tauri.version + "_x64-setup.exe"
		);
		const bundle = "./dist/update-" + tauri.version + ".zip";
		if (fs.existsSync(folderPath + exeFile)) {
			await compress(bundle, null, [
				folderPath + exeFile,
				folderPath + exeFile + ".sig",
			]);
			return {
				bundle,
				version: tauri.version,
				app: tauri.identifier,
				platform: "tauri",
			};
		} else {
			throw new Error("Bundle not found: " + folderPath + exeFile);
		}
	} catch (error: any) {
		throw new Error(error);
	}
};
