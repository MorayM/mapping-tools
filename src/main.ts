import { MarkdownView, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, OMapsFetcherSettingTab, type OMapsFetcherSettings } from "./settings";
import { captureLocationFromGeoLink } from "./commands/captureLocation";

export default class OMapsFetcherPlugin extends Plugin {
	settings: OMapsFetcherSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "capture-location-from-geo-link",
			name: "Capture location from geo link",
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view?.file) {
					if (!checking) {
						captureLocationFromGeoLink(this);
					}
					return true;
				}
				return false;
			},
		});

		this.addSettingTab(new OMapsFetcherSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<OMapsFetcherSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
