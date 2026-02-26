import type { OverpassElement } from "../types";

function escapeYamlString(s: string): string {
	if (/[\n:"\\]/.test(s)) return JSON.stringify(s);
	return s;
}

function valueToYaml(v: unknown, indent: string): string {
	if (v === null || v === undefined) return "";
	if (typeof v === "number" || typeof v === "boolean") return String(v);
	if (typeof v === "string") return escapeYamlString(v);
	if (Array.isArray(v)) {
		const lines = v.map((item) => indent + "- " + valueToYaml(item, indent + "  ").trim());
		return "\n" + lines.join("\n");
	}
	if (typeof v === "object") {
		const lines: string[] = [];
		for (const [key, val] of Object.entries(v)) {
			if (val === undefined) continue;
			const nextIndent = indent + "  ";
			const part = valueToYaml(val, nextIndent);
			const sep = part.startsWith("\n") ? ":" : ": ";
			lines.push(`${indent}${key}${sep}${part.trimStart()}`);
		}
		return "\n" + lines.join("\n");
	}
	return String(v);
}

export function elementToYaml(el: OverpassElement): string {
	const lines: string[] = [];
	for (const [key, val] of Object.entries(el)) {
		if (val === undefined) continue;
		const part = valueToYaml(val, "  ");
		const sep = part.startsWith("\n") ? ":" : ": ";
		lines.push(`${key}${sep}${part.trimStart()}`);
	}
	return lines.join("\n");
}

export function formatAppendBlock(el: OverpassElement): string {
	return "\n\n## OSM feature\n\n```json\n" + JSON.stringify(el, null, 2) + "\n```\n";
}
