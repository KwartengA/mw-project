import { useAtom } from "jotai";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import { type MapRef, Marker, Map as MbMap } from "react-map-gl/mapbox";

import { map } from "~/lib/map";
import { useColorScheme } from "~/lib/use-color-scheme";

interface Props {
  initialLatLng?: { lat: number; lng: number; image?: string };
}

function GeospyMap({ initialLatLng }: Props) {
  return <M initialLatLng={initialLatLng} />;
}

function M({ initialLatLng }: Props) {
  const [show, setShow] = React.useState(false);
  const [, setMap] = useAtom(map);

  const scheme = useColorScheme();
  const mapStyle =
    scheme === "dark"
      ? "mapbox://styles/graylark-degreat/cm3lxyppr00n301r888ffck0s"
      : "mapbox://styles/mapbox/streets-v11";

  const mapRef = React.useRef<MapRef>(null);

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
      onLoad={(map) => setMap(map.target)}
      preserveDrawingBuffer
    >
      {initialLatLng?.image ? (
        <Marker
          latitude={initialLatLng.lat}
          longitude={initialLatLng.lng}
        >
          <div className="size-12 rounded-full overflow-hidden border-2 border-black/60">
            <img
              src={initialLatLng.image}
              alt="Initial"
              className="h-full object-cover w-full"
            />
          </div>
        </Marker>
      ) : null}
    </MbMap>
  );
}

export default GeospyMap;
