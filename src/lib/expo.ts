import { Platform, Release } from "../types";
import { compress, execAsync } from "./util";

const { getConfig } = require("@expo/config");
const fs = require("fs");

export const getExpoBundle = async (
	platform: Platform,
	verbose: boolean = false
): Promise<Release> => {
	const { exp } = getConfig("./", {
		skipSDKVersionRequirement: true,
		isPublicConfig: true,
	});

	try {
		await execAsync(
			"npx expo export --dump-sourcemap --platform " + platform,
			verbose
		);
		const bundle = "./update-" + exp.version + ".zip";
		fs.writeFileSync("./dist/expoConfig.json", JSON.stringify(exp));
		await compress(bundle, "./dist");
		return {
			bundle,
			version: exp.version,
			app: exp.slug,
			platform: "expo",
		};
	} catch (error: any) {
		console.error("Error generating expo bundle:", error);
	}
	throw new Error("Failed to generate expo bundle");
};
