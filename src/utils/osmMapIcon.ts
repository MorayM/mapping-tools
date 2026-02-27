/**
 * Maps OSM tags to Lucide icon names (kebab-case, no prefix) for Obsidian map view.
 * Priority: amenity → shop → tourism → building (fallback) → historic → highway → man_made.
 * Based on openstreetmap-carto feature taxonomy.
 */

const DEFAULT_ICON = "map-pin";

const PRIORITY_KEYS = [
	"amenity",
	"shop",
	"tourism",
	"building",
	"historic",
	"highway",
	"man_made",
] as const;

/** key → (value → Lucide icon name) */
const ICON_BY_TAG: Record<string, Record<string, string>> = {
	amenity: {
		atm: "credit-card",
		bank: "landmark",
		bar: "wine",
		bicycle_rental: "bike",
		bus_station: "bus",
		cafe: "coffee",
		car_rental: "car",
		charging_station: "battery-charging",
		cinema: "film",
		clinic: "stethoscope",
		community_centre: "users",
		doctors: "stethoscope",
		fast_food: "utensils-crossed",
		fire_station: "flame",
		fuel: "fuel",
		hospital: "hospital",
		library: "library",
		nightclub: "music",
		parking: "car",
		pharmacy: "pill",
		place_of_worship: "church",
		police: "shield",
		post_office: "mail",
		pub: "beer",
		restaurant: "utensils-crossed",
		school: "school",
		taxi: "car",
		theatre: "theater",
		toilets: "bath",
		university: "graduation-cap",
		veterinary: "paw-print",
	},
	shop: {
		bakery: "croissant",
		books: "book-open",
		clothes: "shirt",
		convenience: "store",
		florist: "flower-2",
		supermarket: "shopping-cart",
	},
	tourism: {
		apartment: "home",
		attraction: "star",
		camp_site: "tent",
		guest_house: "home",
		hostel: "building",
		hotel: "hotel",
		museum: "landmark",
		viewpoint: "mountain",
	},
	building: {
		hospital: "hospital",
		school: "school",
		university: "graduation-cap",
	},
	historic: {
		castle: "castle",
		monument: "monument",
		museum: "landmark",
	},
	highway: {
		bus_stop: "bus",
	},
	man_made: {
		tower: "tower-control",
	},
};

/**
 * Returns a Lucide icon name (kebab-case, no prefix) for the given OSM tags.
 * Uses amenity → shop → tourism → building → historic → highway → man_made.
 * Fallback: map-pin.
 */
export function osmTagsToLucideIcon(tags: Record<string, string> | undefined): string {
	if (!tags) return DEFAULT_ICON;
	for (const key of PRIORITY_KEYS) {
		const value = tags[key];
		if (value) {
			const byKey = ICON_BY_TAG[key];
			const icon = byKey?.[value];
			if (icon) return icon;
		}
	}
	return DEFAULT_ICON;
}
