export interface ParsedFrontmatter {
	/** Key-value pairs; values are raw strings (no parsing of lists etc.) */
	fields: Map<string, string>;
	/** Body after the closing --- */
	body: string;
	/** Whether the file had a frontmatter block */
	hadFrontmatter: boolean;
}

/**
 * Parse frontmatter from file content. First block between --- is treated as YAML.
 * Only simple key: value lines are parsed; multiline/list values are kept as opaque.
 */
export function parseFrontmatter(content: string): ParsedFrontmatter {
	const fields = new Map<string, string>();
	let body = content;
	let hadFrontmatter = false;

	const firstDash = content.indexOf("---");
	if (firstDash === 0) {
		const afterFirst = content.slice(3);
		const endDash = afterFirst.indexOf("---");
		if (endDash !== -1) {
			hadFrontmatter = true;
			const block = afterFirst.slice(0, endDash);
			body = afterFirst.slice(endDash + 3).replace(/^\n?/, "");
			for (const line of block.split(/\n/)) {
				const colon = line.indexOf(":");
				if (colon === -1) continue;
				const key = line.slice(0, colon).trim();
				const value = line.slice(colon + 1).trim();
				if (key) fields.set(key, value);
			}
		}
	}

	return { fields, body, hadFrontmatter };
}

/** Top-level key line: key at start (no leading space), then colon */
const KEY_LINE = /^([^:\s][^:]*):\s*(.*)$/;

export interface UpdateFrontmatterOptions {
	coordinates: string; // "lat, lng"
	geoLink: string;     // full geo:... link
	geoLinkKey: string;  // e.g. "geo" — only set if not already present
}

/**
 * Update frontmatter: set coordinates and geo link property only if missing or empty.
 * Existing non-empty values are preserved; empty keys get our value; missing keys are appended.
 */
export async function updateFrontmatter(
	content: string,
	opts: UpdateFrontmatterOptions
): Promise<string> {
	const firstDash = content.indexOf("---");
	if (firstDash !== 0) {
		// No frontmatter: create new block with our keys only
		const yaml = `coordinates: ${opts.coordinates}\n${opts.geoLinkKey}: ${opts.geoLink}`;
		return `---\n${yaml}\n---\n\n${content}`;
	}

	const afterFirst = content.slice(3);
	const endDash = afterFirst.indexOf("---");
	if (endDash === -1) return content;

	const block = afterFirst.slice(0, endDash);
	const body = afterFirst.slice(endDash + 3).replace(/^\n?/, "");

	const lines = block.split(/\n/);
	const out: string[] = [];
	let replacedCoordinates = false;
	let seenGeoKey = false;
	const quoteVal = (v: string) => (/[:[\]#\n]/.test(v) ? `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : v);

	for (const line of lines) {
		// Indented line or empty: keep as-is (multiline / list value)
		if (/^\s/.test(line) || line.trim() === "") {
			out.push(line);
			continue;
		}
		const m = line.match(KEY_LINE);
		if (!m || m[1] === undefined) {
			out.push(line);
			continue;
		}
		const key = m[1].trim();
		const value = (m[2] ?? "").trim();
		if (key === "coordinates") {
			if (value !== "") {
				out.push(line);
			} else {
				out.push(`coordinates: ${quoteVal(opts.coordinates)}`);
			}
			replacedCoordinates = true;
		} else if (key === opts.geoLinkKey) {
			if (value !== "") {
				out.push(line);
			} else {
				out.push(`${opts.geoLinkKey}: ${quoteVal(opts.geoLink)}`);
			}
			seenGeoKey = true;
		} else {
			out.push(line);
		}
	}

	if (!replacedCoordinates) {
		out.push(`coordinates: ${quoteVal(opts.coordinates)}`);
	}
	if (!seenGeoKey) {
		out.push(`${opts.geoLinkKey}: ${quoteVal(opts.geoLink)}`);
	}

	return `---\n${out.join("\n")}\n---\n${body}`;
}
