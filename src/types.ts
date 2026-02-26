export interface GeoLink {
	lat: number;
	lon: number;
	rawLink: string;
}

export interface OverpassElement {
	type: "node" | "way" | "relation";
	id: number;
	lat?: number;
	lon?: number;
	bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
	tags?: Record<string, string>;
	nodes?: number[];
	members?: Array<{ type: string; ref: number; role: string }>;
	geometry?: Array<{ lat: number; lon: number }>;
	[key: string]: unknown;
}

export interface OverpassResponse {
	version: number;
	generator: string;
	elements: OverpassElement[];
}
