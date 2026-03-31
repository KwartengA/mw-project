export interface AutocompletePrediction {
	place_id: string;
	description: string;
}

// Referred from https://gist.github.com/botzill/fc2a1581873200739f6dc5c1daf85a7d
const ghanaBounds: google.maps.LatLngBoundsLiteral = {
	north: 11.1748562,
	south: 4.5392525,
	east: 1.2732942,
	west: -3.260786,
};

async function getPlaceDetails(
	placeId: string,
): Promise<google.maps.places.PlaceResult> {
	if (!window.google || !window.google.maps) {
		throw new Error("Google Maps API not loaded");
	}

	const place = new google.maps.places.Place({ id: placeId });

	await place.fetchFields({
		fields: ["location", "formattedAddress"],
	});

	return {
		place_id: placeId,
		formatted_address: place.formattedAddress,
		geometry: { location: place.location },
	} as google.maps.places.PlaceResult;
}

async function getLocationSuggestions(
	query: string,
): Promise<AutocompletePrediction[]> {
	if (!window.google || !window.google.maps) {
		throw new Error("Google Maps API not loaded");
	}

	const response =
		await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
			{
				input: query,
				region: "GH",
				locationRestriction: ghanaBounds,
			},
		);

	return (response.suggestions || [])
		.filter((s) => s.placePrediction?.placeId)
		.map((s) => ({
			place_id: s.placePrediction?.placeId || "",
			description: `${s.placePrediction?.mainText || ""}, ${s.placePrediction?.secondaryText?.text || ""}`,
		}));
}

async function reverseGeocode(lng: number, lat: number): Promise<string> {
	if (!window.google || !window.google.maps) {
		throw new Error("Google Maps API not loaded");
	}

	try {
		const geocoder = new google.maps.Geocoder();

		return new Promise<string>((resolve, reject) => {
			geocoder.geocode({ location: { lat, lng } }, (results, status) => {
				if (status !== google.maps.GeocoderStatus.OK) {
					reject(new Error(`Geocoding failed with status: ${status}`));
					return;
				}

				if (!results?.length) {
					reject(new Error("No geocoding results found"));
					return;
				}

				resolve(results[0].formatted_address);
			});
		});
	} catch (error) {
		throw error instanceof Error ? error : new Error("Geocoding failed");
	}
}

export { getLocationSuggestions, getPlaceDetails, reverseGeocode };
