import {Map as MapboxMap} from "mapbox-gl";
import {atom} from "jotai"

const map = atom<MapboxMap | null>(null);

export { map };