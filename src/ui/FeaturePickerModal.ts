import { App, Modal } from "obsidian";
import type { OverpassElement } from "../types";

function labelFor(el: OverpassElement): string {
	const t = el.tags;
	if (t?.name) return t.name;
	if (t?.amenity) return t.amenity;
	if (t?.shop) return t.shop;
	if (t?.tourism) return t.tourism;
	return `${el.type} ${el.id}`;
}

export class FeaturePickerModal extends Modal {
	constructor(
		app: App,
		private readonly items: OverpassElement[],
		private readonly onSelect: (element: OverpassElement) => void
	) {
		super(app);
	}

	onOpen(): void {
		this.titleEl.setText("Select OSM feature");
		const listEl = this.contentEl.createDiv({ cls: "omaps-fetcher-list omaps-fetcher-scroll" });
		for (const el of this.items) {
			const row = listEl.createDiv({ cls: "omaps-fetcher-row" });
			row.setText(labelFor(el));
			row.addEventListener("click", () => {
				this.onSelect(el);
				this.close();
			});
		}
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
