import type { OverpassElement } from "../types";

const PLACEHOLDER_REGEX = /\{=osm:([^}=]+)=\}/g;

export interface ApplyOsmTemplateResult {
	content: string;
	replaced: number;
}

export function applyOsmTemplate(content: string, el: OverpassElement): ApplyOsmTemplateResult {
	let replaced = 0;
	const tags = el.tags;

	const result = content.replace(PLACEHOLDER_REGEX, (match, key: string) => {
		if (key === "osm_raw") {
			replaced++;
			return "```json\n" + JSON.stringify(el, null, 2) + "\n```";
		}

		if (key === "osm_tags") {
			if (!tags) return match;
			const entries = Object.entries(tags);
			if (entries.length === 0) return match;

			const sorted = entries.sort(([a], [b]) => a.localeCompare(b));
			const rows = sorted.map(([k, v]) => {
				const safeValue = String(v).replace(/\|/g, "\\|");
				return `| ${k} | ${safeValue} |`;
			});

			const tableLines = ["| Key | Value |", "| --- | ----- |", ...rows];
			replaced++;
			return tableLines.join("\n");
		}

		if (!tags) return match;
		if (!Object.prototype.hasOwnProperty.call(tags, key)) return match;
		const value = tags[key];
		if (value === undefined || value === null) return match;

		replaced++;
		return String(value);
	});

	return { content: result, replaced };
}

