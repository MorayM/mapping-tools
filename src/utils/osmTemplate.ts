import type { OverpassElement } from "../types";

const PLACEHOLDER_REGEX = /\{=osm:([^}=]+)=\}/g;

/** Normalize addr:full to a single line. */
function normalizeFull(full: string): string {
	return full.trim().replace(/\s+/g, " ");
}

/**
 * Build a single-line address from addr:* tags. Uses addr:full if present; otherwise
 * assembles parts in partOrder (street/place at most one). Returns null if no address data.
 */
export function formatAddress(
	tags: Record<string, string> | undefined,
	partOrder: string[]
): string | null {
	if (!tags) return null;
	const full = tags["addr:full"];
	if (full !== undefined && full !== null && String(full).trim() !== "") {
		return normalizeFull(String(full));
	}
	const parts: string[] = [];
	let seenStreetOrPlace = false;
	for (const part of partOrder) {
		const key = `addr:${part}`;
		if (!Object.prototype.hasOwnProperty.call(tags, key)) continue;
		const value = tags[key];
		if (value === undefined || value === null || String(value).trim() === "") continue;
		if (part === "street" || part === "place") {
			if (seenStreetOrPlace) continue;
			seenStreetOrPlace = true;
		}
		parts.push(String(value).trim());
	}
	return parts.length > 0 ? parts.join(", ") : null;
}

export interface ApplyOsmTemplateOptions {
	addressPartOrder?: string[];
}

export interface ApplyOsmTemplateResult {
	content: string;
	replaced: number;
}

export function applyOsmTemplate(
	content: string,
	el: OverpassElement,
	options?: ApplyOsmTemplateOptions
): ApplyOsmTemplateResult {
	let replaced = 0;
	const tags = el.tags;
	const addressPartOrder = options?.addressPartOrder ?? [];

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

		if (key === "address") {
			const formatted = formatAddress(tags, addressPartOrder);
			if (formatted !== null) {
				replaced++;
				return formatted;
			}
			return match;
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

