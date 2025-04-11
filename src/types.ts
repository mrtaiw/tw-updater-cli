export interface Release {
	bundle: string;
	version: string;
	app: string;
	note?: string;
	platform: "expo" | "tauri";
}

export type Platform = "android" | "ios" | "tauri" | "all";
