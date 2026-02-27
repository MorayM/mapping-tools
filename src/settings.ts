/* eslint-disable obsidianmd/ui/sentence-case */
import { App, PluginSettingTab, Setting } from "obsidian";
import type OMapsFetcherPlugin from "./main";

export interface OMapsFetcherSettings {
	radiusMeters: number;
	overpassEndpoint: string;
	geoLinkProperty: string;
	searchAllFeatures: boolean;
	addressPartOrder: string[];
}

const DEFAULT_ADDRESS_PART_ORDER = [
	"housenumber", "housename", "street", "place", "unit", "door", "floor", "flats",
	"block", "block_number", "plot", "postbox", "hamlet", "suburb", "subdistrict",
	"district", "city", "county", "state", "province", "postcode", "country",
];

export const DEFAULT_SETTINGS: OMapsFetcherSettings = {
	radiusMeters: 20,
	overpassEndpoint: "https://overpass-api.de/api/interpreter",
	geoLinkProperty: "geo",
	searchAllFeatures: false,
	addressPartOrder: [...DEFAULT_ADDRESS_PART_ORDER],
};

export class OMapsFetcherSettingTab extends PluginSettingTab {
	plugin: OMapsFetcherPlugin;

	constructor(app: App, plugin: OMapsFetcherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Search radius (m)")
			 
			.setDesc("Distance in meters for Overpass 'around' query.")
			.addText((text) =>
				text
					.setPlaceholder("20")
					.setValue(String(this.plugin.settings.radiusMeters))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						this.plugin.settings.radiusMeters = Number.isNaN(n) ? 20 : Math.max(1, n);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Overpass API endpoint")
			.setDesc("Overpass interpreter URL. Leave default unless you use your own instance.")
			.addText((text) =>
				text
					.setPlaceholder("https://overpass-api.de/api/interpreter")
					.setValue(this.plugin.settings.overpassEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.overpassEndpoint = value?.trim() || DEFAULT_SETTINGS.overpassEndpoint;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Geo link frontmatter key")
			.setDesc("Property name for the geo: link in frontmatter.")
			.addText((text) =>
				text
					.setPlaceholder("geo")
					.setValue(this.plugin.settings.geoLinkProperty)
					.onChange(async (value) => {
						this.plugin.settings.geoLinkProperty = value?.trim() || "geo";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Search everything")
			.setDesc("If on, return all OSM elements in radius. If off, only elements with name or common tags (amenity, shop, tourism).")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.searchAllFeatures)
					.onChange(async (value) => {
						this.plugin.settings.searchAllFeatures = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Address part order")
			.setDesc("Comma-separated list of addr part names for {=osm:address=}. Used when addr:full is not set. Default: housenumber, street, city, postcode, country, …")
			.addText((text) =>
				text
					.setPlaceholder("housenumber, street, city, postcode, country")
					.setValue(this.plugin.settings.addressPartOrder.join(", "))
					.onChange(async (value) => {
						const order = value
							.split(",")
							.map((s) => s.trim().toLowerCase())
							.filter(Boolean);
						this.plugin.settings.addressPartOrder = order.length > 0 ? order : [...DEFAULT_ADDRESS_PART_ORDER];
						await this.plugin.saveSettings();
					})
			);
	}
}
