import { Platform, Release } from "../types";
import { getTauriBundle } from "./tauri";
import { getExpoBundle } from "./expo";

export const generateRelease = async (
	platform: Platform,
	verbose: boolean = false
): Promise<Release> => {
	if (platform === "tauri") {
		return await getTauriBundle(verbose);
	} else {
		return await getExpoBundle(platform, verbose);
	}
};
