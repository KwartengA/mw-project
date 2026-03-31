import { useLoadScript } from "@react-google-maps/api";
import { LocationSearch } from "~/components/location-search";

const LIBRARIES: ["places"] = ["places"];

interface Props {
	onLocationSelect: (
		coords: { lat: number; lng: number },
		address: string,
	) => void;
}

export function MapLocationSearch({ onLocationSelect }: Props) {
	useLoadScript({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: LIBRARIES,
	});

	return (
		<div className="w-52 md:w-72">
			<LocationSearch
				onLocationSelect={([lng, lat], address) =>
					onLocationSelect({ lat, lng }, address ?? "")
				}
			/>
		</div>
	);
}
