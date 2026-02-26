import type { GeoLink } from "../types";

const GEO_LINK_REGEX = /geo:(-?[\d.]+),(-?[\d.]+)(?:\?[^\s\]]*)?/i;

/**
 * Find first geo: link in note content (body or frontmatter).
 * Returns { lat, lon, rawLink } or null.
 */
export function parseGeoLink(content: string): GeoLink | null {
	const match = content.match(GEO_LINK_REGEX);
	if (!match || match[1] === undefined || match[2] === undefined) return null;
	const rawLink = match[0];
	const lat = parseFloat(match[1]);
	const lon = parseFloat(match[2]);
	if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
	return { lat, lon, rawLink };
}
