import fs from "fs";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import chalk from "chalk";
import dotenv from "dotenv";
import path from "path";

import { Release } from "../types";

/**
 * Upload a file to the server
 * @param release - Release object containing file path, version, app ID, and note
 * @param token - Authentication token
 * @returns {Promise<AxiosResponse["data"] | null>} - Response data or null on failure
 */
const uploadFile = async (
	release: Release,
	token: string
): Promise<AxiosResponse["data"] | null> => {
	dotenv.config({ path: path.resolve(process.cwd(), ".env") });
	try {
		if (!fs.existsSync(release.bundle)) {
			console.log(chalk.red(`File not found: ${release.bundle}`));
			return null;
		}

		const form = new FormData();
		form.append("bundle", fs.createReadStream(release.bundle));
		form.append("version", release.version);
		form.append("app", release.app);
		form.append("note", release.note);
		form.append("platform", release.platform);

		// Make request to upload endpoint
		const domain = process.env.TW_UPDATER_URL || "https://u.mrtaiw.dev";
		const response = await axios.post(domain + "/api/releases", form, {
			headers: {
				...form.getHeaders(),
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.status >= 200 && response.status < 300) {
			return response.data;
		} else {
			console.log(
				chalk.red(`Upload failed with status: ${response.status}`)
			);
			return null;
		}
	} catch (error: any) {
		console.error(chalk.red("Upload error:"), error.message);
		return null;
	}
};

export { uploadFile };
