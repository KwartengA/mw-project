import { useMounted } from "@mw/common";
import { useAtom } from "jotai";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import {
	type MapEvent,
	type MapRef,
	Marker,
	Map as MbMap,
} from "react-map-gl/mapbox";

import { map } from "~/lib/map";
import { useColorScheme } from "~/lib/use-color-scheme";

interface Props {
	initialLatLng?: { lat: number; lng: number; image?: string };
}

function GeospyMap({ initialLatLng }: Props) {
	return (
		<ClientOnly>
			<M initialLatLng={initialLatLng} />
		</ClientOnly>
	);
}

function ClientOnly({ children }: { children: React.ReactNode }) {
	const mounted = useMounted();
	if (!mounted) return null;
	return <>{children}</>;
}

function M({ initialLatLng }: Props) {
	const [, setMap] = useAtom(map);
	const scheme = useColorScheme();

	const mapRef = React.useRef<MapRef>(null);
	const [isLoaded, setIsLoaded] = React.useState(false);

	const mapStyle =
		scheme === "dark"
			? import.meta.env.VITE_MAPBOX_DARK_STYLE
			: "mapbox://styles/mapbox/streets-v11";

	function handleLoad(e: MapEvent) {
		setMap(e.target);
		setIsLoaded(true);
	}

	React.useEffect(() => {
		if (!isLoaded || !mapRef.current || !initialLatLng) return;

		mapRef.current.flyTo({
			center: [initialLatLng.lng, initialLatLng.lat],
			zoom: 14,
			duration: 2500,
			offset: [0, window.innerWidth < 768 ? -200 : 0],
			essential: true,
		});
	}, [initialLatLng, isLoaded]);

	return (
		<MbMap
			mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
			initialViewState={{
				longitude: initialLatLng?.lng || -122.009102,
				latitude: initialLatLng?.lat || 37.334606,
				zoom: 12,
			}}
			style={{ width: "100%", height: "100%" }}
			mapStyle={mapStyle}
			ref={mapRef}
			onLoad={handleLoad}
			preserveDrawingBuffer
		>
			{initialLatLng?.image && (
				<Marker latitude={initialLatLng.lat} longitude={initialLatLng.lng}>
					<div className="size-12 rounded-full overflow-hidden border-2 border-black/60">
						<img
							src={initialLatLng.image}
							alt="Initial"
							className="h-full object-cover w-full"
						/>
					</div>
				</Marker>
			)}
		</MbMap>
	);
}

export default GeospyMap;
