import type { OverpassResponse, OverpassElement } from "../types";

const DEFAULT_TAGS = ["name", "amenity", "shop", "tourism"];

function buildFilteredQuery(lat: number, lon: number, radiusMeters: number): string {
	const parts: string[] = [];
	for (const tag of DEFAULT_TAGS) {
		parts.push(`node(around:${radiusMeters},${lat},${lon})["${tag}"];`);
		parts.push(`way(around:${radiusMeters},${lat},${lon})["${tag}"];`);
		parts.push(`relation(around:${radiusMeters},${lat},${lon})["${tag}"];`);
	}
	return `[out:json][timeout:25];(${parts.join("")});out body;`;
}

function buildUnfilteredQuery(lat: number, lon: number, radiusMeters: number): string {
	return `[out:json][timeout:25];(node(around:${radiusMeters},${lat},${lon});way(around:${radiusMeters},${lat},${lon});relation(around:${radiusMeters},${lat},${lon}););out body;`;
}

export async function queryOverpass(
	endpoint: string,
	lat: number,
	lon: number,
	radiusMeters: number,
	searchAllFeatures: boolean
): Promise<OverpassElement[]> {
	const query = searchAllFeatures
		? buildUnfilteredQuery(lat, lon, radiusMeters)
		: buildFilteredQuery(lat, lon, radiusMeters);

	const res = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: "data=" + encodeURIComponent(query),
	});

	if (!res.ok) {
		throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
	}

	const data = (await res.json()) as OverpassResponse;
	if (!data.elements || !Array.isArray(data.elements)) {
		throw new Error("Invalid Overpass response");
	}
	return data.elements;
}
