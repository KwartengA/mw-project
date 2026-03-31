import { tryit } from "radashi";
import React from "react";
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "react-router";
import { AddIncidentModal } from "~/components/add-incident-modal";
import { AddResourceModal } from "~/components/add-resource-modal";
import { AffiliationBadge } from "~/components/affiliation";
import GeospyMap from "~/components/map";
import { MapLocationSearch } from "~/components/map-location-search";
import { Navbar } from "~/components/navbar";
import Navigation from "~/components/navigation";
import { checkAuth } from "~/lib/check-auth";

export const meta: MetaFunction = () => {
	return [
		{ title: "Map App" },
		{ name: "description", content: "Just do it!" },
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [err] = await tryit(checkAuth)(request);

	if (err) {
		throw redirect("/login");
	}
};

export default function Index() {
	const [mapFocus, setMapFocus] = React.useState({
		lat: 5.614818,
		lng: -0.205874,
	});
	const [incidentModalOpen, setIncidentModalOpen] = React.useState(false);
	const [resourceModalOpen, setResourceModalOpen] = React.useState(false);
	const [incidentCoords, setIncidentCoords] = React.useState<
		{ lat: number; lng: number } | undefined
	>(undefined);
	const [searchPin, setSearchPin] = React.useState<
		{ lat: number; lng: number; address: string } | undefined
	>(undefined);

	function handleRequestIncidentAt(coords: { lat: number; lng: number }) {
		setIncidentCoords(coords);
		setIncidentModalOpen(true);
	}

	function handleIncidentCreated(incident: {
		location?: { center?: number[] | null } | null;
	}) {
		const center = incident.location?.center;
		if (!Array.isArray(center) || center.length < 2) return;

		const lng = Number(center[0]);
		const lat = Number(center[1]);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

		setMapFocus({ lat, lng });
	}

	function handleLocationSearch(
		coords: { lat: number; lng: number },
		address: string,
	) {
		setSearchPin({ ...coords, address });
		setMapFocus(coords); // fly the map there
	}

	function handleRequestResourceAt(coords: { lat: number; lng: number }) {
		setIncidentCoords(coords);
		setResourceModalOpen(true);
	}

	function handleResourceCreated(coords: { lat: number; lng: number }) {
		setMapFocus(coords);
	}

	return (
		<div className="h-screen flex flex-col">
			<div className="h-full flex-1 relative">
				<div className="absolute top-0 left-0 md:pt-3 p-2 md:px-3 z-100 bottom-0">
					<Navigation />
				</div>

				<div className="absolute top-0 right-0 md:pt-3 p-2 md:px-3 z-100 flex items-center gap-2">
					<MapLocationSearch onLocationSelect={handleLocationSearch} />
					<AffiliationBadge />
					<Navbar />
				</div>

				<GeospyMap
					initialLatLng={mapFocus}
					searchPin={searchPin}
					onSearchPinDismiss={() => setSearchPin(undefined)}
					onRequestIncidentAt={handleRequestIncidentAt}
					onRequestResourceAt={handleRequestResourceAt}
				/>
				<AddIncidentModal
					open={incidentModalOpen}
					onClose={() => setIncidentModalOpen(false)}
					initialLatLng={incidentCoords}
					onCreated={handleIncidentCreated}
				/>

				<AddResourceModal
					open={resourceModalOpen}
					onClose={() => setResourceModalOpen(false)}
					initialLatLng={incidentCoords}
					onCreated={handleResourceCreated}
				/>
			</div>
		</div>
	);
}
