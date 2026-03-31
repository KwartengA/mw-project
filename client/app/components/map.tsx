import { useAtom } from "jotai";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import {
	type MapEvent,
	type MapRef,
	Marker,
	Map as MbMap,
} from "react-map-gl/mapbox";
import { AddMenu } from "~/components/add-menu";
import { IncidentInfoCard } from "~/components/incident-info-card";
import { resolveIncidentTypeIcon } from "~/lib/config";
import { map } from "~/lib/map";
import {
	incidentFocusRequestAtom,
	resourceFocusRequestAtom,
} from "~/lib/store";
import type {
	DispatchVehicleStatus,
	DispatchVehicleType,
	Incident,
} from "~/lib/types";
import { useColorScheme } from "~/lib/use-color-scheme";
import { useDispatchResources } from "~/lib/use-dispatch";
import { useIncidents } from "~/lib/use-incidents";
import { useMounted } from "~/lib/use-mounted";

interface Props {
	initialLatLng?: { lat: number; lng: number; image?: string };
	searchPin?: { lat: number; lng: number; address: string };
	onSearchPinDismiss?: () => void;
	onRequestIncidentAt?: (coords: { lat: number; lng: number }) => void;
	onRequestResourceAt?: (coords: { lat: number; lng: number }) => void;
}

type MapMarkerIncident = {
	id: Incident["id"];
	incident: Incident;
	lat: number;
	lng: number;
	status: Incident["status"];
	isActive: boolean;
	title: string;
	typeIcon: ReturnType<typeof resolveIncidentTypeIcon>;
};

type MapMarkerResource = {
	id: number;
	callSign: string;
	status: DispatchVehicleStatus;
	vehicleType: DispatchVehicleType;
	driverName: string;
	stationName: string;
	lat: number;
	lng: number;
	isActive: boolean;
	incidentId: string | undefined;
};

type MapMarkerStation = {
	id: number;
	name: string;
	type: "ambulance" | "fire" | "police";
	address: string;
	lat: number;
	lng: number;
	responderCount: number;
	activeDispatches: number;
	hasActiveDispatches: boolean;
};

function vehicleMarkerGlyph(type: DispatchVehicleType) {
	if (type === "ambulance") return "🚑";
	if (type === "fire_truck") return "🚒";
	if (type === "police_car") return "🚓";
	return "🏍️";
}

function stationMarkerConfig(type: "ambulance" | "fire" | "police") {
	if (type === "ambulance") {
		return {
			icon: "🏥",
			bg: "bg-blue-500/30 text-white",
			ping: "bg-blue-500/30",
		};
	}

	if (type === "fire") {
		return {
			icon: "👨🏾‍🚒",
			bg: "bg-orange-500/30 text-white",
			ping: "bg-orange-500/30",
		};
	}

	return {
		icon: "👮🏽",
		bg: "bg-indigo-600/30 text-white",
		ping: "bg-indigo-500/30",
	};
}

function getMarkerTitle(incident: Incident) {
	return (
		incident.type?.category || incident.type?.code || `Incident #${incident.id}`
	);
}

function GeospyMap({
	initialLatLng,
	onRequestIncidentAt,
	onRequestResourceAt,
	onSearchPinDismiss,
	searchPin,
}: Props) {
	return (
		<ClientOnly>
			<MapContent
				searchPin={searchPin}
				initialLatLng={initialLatLng}
				onRequestIncidentAt={onRequestIncidentAt}
				onRequestResourceAt={onRequestResourceAt}
				onSearchPinDismiss={onSearchPinDismiss}
			/>
		</ClientOnly>
	);
}

function ClientOnly({ children }: { children: React.ReactNode }) {
	const mounted = useMounted();
	if (!mounted) return null;
	return <>{children}</>;
}

function MapContent({
	initialLatLng,
	onRequestIncidentAt,
	onRequestResourceAt,
	searchPin,
	onSearchPinDismiss,
}: Props) {
	const [, setMap] = useAtom(map);
	const { scheme } = useColorScheme();
	const { items: incidents } = useIncidents({ limit: 100 });
	const { vehicles, activeDispatches, stations } = useDispatchResources();
	const [addMenu, setAddMenu] = React.useState<{
		x: number;
		y: number;
		lat: number;
		lng: number;
	} | null>(null);
	const [selectedIncident, setSelectedIncident] =
		React.useState<MapMarkerIncident | null>(null);
	const [selectedResource, setSelectedResource] =
		React.useState<MapMarkerResource | null>(null);
	const [selectedStation, setSelectedStation] =
		React.useState<MapMarkerStation | null>(null);
	const [focusRequest, setFocusRequest] = useAtom(incidentFocusRequestAtom);
	const [resourceFocusRequest, setResourceFocusRequest] = useAtom(
		resourceFocusRequestAtom,
	);

	const mapRef = React.useRef<MapRef>(null);
	const showInfoTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const [isLoaded, setIsLoaded] = React.useState(false);

	const mapStyle =
		scheme === "dark"
			? import.meta.env.VITE_MAPBOX_DARK_STYLE
			: "mapbox://styles/mapbox/streets-v11";

	function handleLoad(event: MapEvent) {
		setMap(event.target);
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

	const markers = React.useMemo<MapMarkerIncident[]>(() => {
		return incidents
			.map((incident) => {
				const center = incident.location?.center;
				if (!Array.isArray(center) || center.length < 2) return null;

				const lng = Number(center[0]);
				const lat = Number(center[1]);
				if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

				return {
					id: incident.id,
					incident,
					lat,
					lng,
					status: incident.status,
					isActive: !["resolved", "cancelled"].includes(incident.status),
					title: getMarkerTitle(incident),
					typeIcon: resolveIncidentTypeIcon(incident.type?.code),
				};
			})
			.filter((marker): marker is MapMarkerIncident => marker !== null);
	}, [incidents]);

	const activeDispatchByVehicle = React.useMemo(() => {
		return new Map(activeDispatches.map((item) => [item.vehicleId, item]));
	}, [activeDispatches]);

	const vehiclesByStationId = React.useMemo(() => {
		const grouped = new Map<number, typeof vehicles>();

		for (const vehicle of vehicles) {
			if (!vehicle.stationId) continue;
			const existing = grouped.get(vehicle.stationId);
			if (existing) {
				existing.push(vehicle);
				continue;
			}
			grouped.set(vehicle.stationId, [vehicle]);
		}

		return grouped;
	}, [vehicles]);

	const stationMarkers = React.useMemo<MapMarkerStation[]>(() => {
		return stations
			.map((station) => {
				const lat = Number(station.location?.lat);
				const lng = Number(station.location?.lng);
				if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

				const stationVehicles = vehiclesByStationId.get(station.id) ?? [];
				const activeCount = stationVehicles.reduce((count, vehicle) => {
					return count + (activeDispatchByVehicle.has(vehicle.id) ? 1 : 0);
				}, 0);

				return {
					id: station.id,
					name: station.name,
					type: station.type,
					address: station.location?.address ?? "Unknown address",
					lat,
					lng,
					responderCount: stationVehicles.length,
					activeDispatches: activeCount,
					hasActiveDispatches: activeCount > 0,
				};
			})
			.filter((station): station is MapMarkerStation => station !== null);
	}, [activeDispatchByVehicle, stations, vehiclesByStationId]);

	const resourceMarkers = React.useMemo(() => {
		return vehicles
			.map((vehicle) => {
				const latest = vehicle.locations?.[0];
				const stationLocation = vehicle.station?.location;

				const lat = Number(latest?.lat ?? stationLocation?.lat);
				const lng = Number(latest?.lng ?? stationLocation?.lng);
				if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

				const activeDispatch = activeDispatchByVehicle.get(vehicle.id);

				return {
					id: vehicle.id,
					callSign: vehicle.callSign,
					status: vehicle.status,
					vehicleType: vehicle.type,
					driverName: vehicle.driver?.name ?? "Unknown",
					stationName: vehicle.station?.name ?? "Unknown",
					lat,
					lng,
					isActive: Boolean(activeDispatch),
					incidentId: activeDispatch?.incidentId,
				};
			})
			.filter((item): item is MapMarkerResource => item !== null);
	}, [activeDispatchByVehicle, vehicles]);

	React.useEffect(() => {
		if (!selectedIncident) return;

		const refreshedSelection = markers.find(
			(marker) => marker.id === selectedIncident.id,
		);

		if (!refreshedSelection) {
			setSelectedIncident(null);
			return;
		}

		if (refreshedSelection !== selectedIncident) {
			setSelectedIncident(refreshedSelection);
		}
	}, [markers, selectedIncident]);

	React.useEffect(() => {
		if (!selectedResource) return;

		const refreshedSelection = resourceMarkers.find(
			(marker) => marker.id === selectedResource.id,
		);

		if (!refreshedSelection) {
			setSelectedResource(null);
			return;
		}

		if (refreshedSelection !== selectedResource) {
			setSelectedResource(refreshedSelection);
		}
	}, [resourceMarkers, selectedResource]);

	React.useEffect(() => {
		if (!selectedStation) return;

		const refreshedSelection = stationMarkers.find(
			(marker) => marker.id === selectedStation.id,
		);

		if (!refreshedSelection) {
			setSelectedStation(null);
			return;
		}

		if (refreshedSelection !== selectedStation) {
			setSelectedStation(refreshedSelection);
		}
	}, [selectedStation, stationMarkers]);

	const clearShowInfoTimer = React.useCallback(() => {
		if (!showInfoTimerRef.current) return;
		clearTimeout(showInfoTimerRef.current);
		showInfoTimerRef.current = null;
	}, []);

	const focusIncidentWithMicroInteraction = React.useCallback(
		(marker: MapMarkerIncident, delayMs = 700) => {
			clearShowInfoTimer();
			setAddMenu(null);
			setSelectedIncident(null);
			setSelectedResource(null);
			setSelectedStation(null);

			if (mapRef.current) {
				mapRef.current.flyTo({
					center: [marker.lng, marker.lat],
					zoom: 15,
					duration: 900,
					offset: [0, window.innerWidth < 768 ? -160 : 0],
					essential: true,
				});
			}

			showInfoTimerRef.current = setTimeout(() => {
				setSelectedIncident(marker);
				showInfoTimerRef.current = null;
			}, delayMs);
		},
		[clearShowInfoTimer],
	);

	const focusResourceWithMicroInteraction = React.useCallback(
		(marker: MapMarkerResource, delayMs = 500) => {
			clearShowInfoTimer();
			setAddMenu(null);
			setSelectedIncident(null);
			setSelectedResource(null);
			setSelectedStation(null);

			if (mapRef.current) {
				mapRef.current.flyTo({
					center: [marker.lng, marker.lat],
					zoom: 15,
					duration: 800,
					offset: [0, window.innerWidth < 768 ? -130 : 0],
					essential: true,
				});
			}

			showInfoTimerRef.current = setTimeout(() => {
				setSelectedResource(marker);
				showInfoTimerRef.current = null;
			}, delayMs);
		},
		[clearShowInfoTimer],
	);

	React.useEffect(() => {
		if (!searchPin || !mapRef.current || !isLoaded) return;

		clearShowInfoTimer();
		setSelectedIncident(null);
		setSelectedResource(null);
		setSelectedStation(null);

		mapRef.current.flyTo({
			center: [searchPin.lng, searchPin.lat],
			zoom: 15,
			duration: 900,
			essential: true,
		});

		// After the fly, open AddMenu at the canvas centre so the user can act
		const timer = setTimeout(() => {
			const canvas = mapRef.current?.getCanvas();
			if (!canvas) return;
			setAddMenu({
				x: canvas.clientWidth / 2,
				y: canvas.clientHeight / 2,
				lat: searchPin.lat,
				lng: searchPin.lng,
			});
		}, 950);

		return () => clearTimeout(timer);
	}, [isLoaded, clearShowInfoTimer, searchPin]);

	const focusStationWithMicroInteraction = React.useCallback(
		(marker: MapMarkerStation, delayMs = 450) => {
			clearShowInfoTimer();
			setAddMenu(null);
			setSelectedIncident(null);
			setSelectedResource(null);
			setSelectedStation(null);

			if (mapRef.current) {
				mapRef.current.flyTo({
					center: [marker.lng, marker.lat],
					zoom: 14,
					duration: 700,
					offset: [0, window.innerWidth < 768 ? -120 : 0],
					essential: true,
				});
			}

			showInfoTimerRef.current = setTimeout(() => {
				setSelectedStation(marker);
				showInfoTimerRef.current = null;
			}, delayMs);
		},
		[clearShowInfoTimer],
	);

	React.useEffect(() => {
		if (!focusRequest) return;

		const marker = markers.find((item) => item.id === focusRequest.incidentId);

		if (!marker) {
			setFocusRequest(null);
			return;
		}

		focusIncidentWithMicroInteraction(marker, 850);

		setFocusRequest(null);
	}, [
		focusIncidentWithMicroInteraction,
		focusRequest,
		markers,
		setFocusRequest,
	]);

	React.useEffect(() => {
		if (!resourceFocusRequest) return;

		const marker = resourceMarkers.find(
			(item) => item.id === resourceFocusRequest.vehicleId,
		);

		if (!marker) {
			setResourceFocusRequest(null);
			return;
		}

		focusResourceWithMicroInteraction(marker);
		setResourceFocusRequest(null);
	}, [
		focusResourceWithMicroInteraction,
		resourceFocusRequest,
		resourceMarkers,
		setResourceFocusRequest,
	]);

	React.useEffect(() => {
		return () => {
			clearShowInfoTimer();
		};
	}, [clearShowInfoTimer]);

	const detailPlacement = React.useMemo(() => {
		const offsetGap = 14;
		const margin = { top: 64, bottom: 64, left: 0, right: 0 }; // adjust to match your chrome

		if (!selectedIncident || !mapRef.current) {
			return {
				anchor: "top-left" as const,
				offset: [offsetGap, offsetGap] as [number, number],
			};
		}

		const point = mapRef.current.project([
			selectedIncident.lng,
			selectedIncident.lat,
		]);
		const canvas = mapRef.current.getCanvas();

		const cardW = 360;
		const cardH = 430;

		const effectiveTop = margin.top;
		const effectiveBottom = canvas.clientHeight - margin.bottom;
		const effectiveLeft = margin.left;
		const effectiveRight = canvas.clientWidth - margin.right;

		const anchorVertical =
			effectiveBottom - point.y < cardH &&
			point.y - effectiveTop > effectiveBottom - point.y
				? "bottom"
				: "top";

		const anchorHorizontal =
			effectiveRight - point.x < cardW &&
			point.x - effectiveLeft > effectiveRight - point.x
				? "right"
				: "left";

		const anchor = `${anchorVertical}-${anchorHorizontal}` as
			| "top-left"
			| "top-right"
			| "bottom-left"
			| "bottom-right";

		return {
			anchor,
			offset: [
				anchorHorizontal === "right" ? -offsetGap : offsetGap,
				anchorVertical === "bottom" ? -offsetGap : offsetGap,
			] as [number, number],
		};
	}, [selectedIncident]);

	return (
		<div className="relative h-full w-full">
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
				onClick={(event) => {
					onSearchPinDismiss?.();
					setSelectedIncident(null);
					setSelectedResource(null);
					setSelectedStation(null);
					setAddMenu({
						x: event.point.x,
						y: event.point.y,
						lat: event.lngLat.lat,
						lng: event.lngLat.lng,
					});
				}}
				preserveDrawingBuffer
			>
				{stationMarkers.map((marker) => {
					const config = stationMarkerConfig(marker.type);

					return (
						<Marker
							key={`station-${marker.id}`}
							latitude={marker.lat}
							longitude={marker.lng}
						>
							<button
								type="button"
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									focusStationWithMicroInteraction(marker);
								}}
								className="relative m-0 border-0 bg-transparent p-0 appearance-none"
								title={`${marker.name} (${marker.type})`}
							>
								{marker.hasActiveDispatches && (
									<span
										className={`absolute inset-0 m-auto size-14 rounded-full animate-ping ${config.ping}`}
									/>
								)}
								<span
									className={`relative flex size-10 items-center justify-center rounded-full shadow ${config.bg}`}
								>
									<span className="text-xl leading-none" aria-hidden="true">
										{config.icon}
									</span>
								</span>
							</button>
						</Marker>
					);
				})}

				{markers.map((marker) => {
					const config = marker.typeIcon;

					return (
						<Marker
							key={marker.id}
							latitude={marker.lat}
							longitude={marker.lng}
						>
							<button
								type="button"
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									focusIncidentWithMicroInteraction(marker);
								}}
								className="relative m-0 border-0 bg-transparent p-0 appearance-none"
							>
								{marker.isActive && (
									<span className="absolute inset-0 m-auto size-14 rounded-full bg-rose-500/35 animate-ping" />
								)}
								<span
									className={`relative flex ${marker.isActive ? "size-12" : "size-10"} items-center justify-center rounded-full shadow ${config.color}`}
								>
									<span
										className={`${config.icon} ${marker.isActive ? "size-7" : "size-6"}`}
									/>
								</span>
							</button>
						</Marker>
					);
				})}

				{resourceMarkers.map((marker) => {
					const isBlue = marker.vehicleType === "ambulance";
					const isOrange = marker.vehicleType === "fire_truck";
					const pingClass = isBlue
						? "bg-blue-500/35"
						: isOrange
							? "bg-orange-500/35"
							: marker.vehicleType === "police_car"
								? "bg-indigo-500/35"
								: "bg-zinc-500/35";

					return (
						<Marker
							key={`resource-${marker.id}`}
							latitude={marker.lat}
							longitude={marker.lng}
						>
							<button
								type="button"
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									focusResourceWithMicroInteraction(marker);
								}}
								className="relative m-0 border-0 bg-transparent p-0 appearance-none"
							>
								{marker.isActive && (
									<span
										className={`absolute inset-0 m-auto size-14 rounded-full animate-ping ${pingClass}`}
									/>
								)}
								<span className="relative flex items-center justify-center">
									<span
										className="text-[28px] leading-none drop-shadow"
										aria-hidden="true"
									>
										{vehicleMarkerGlyph(marker.vehicleType)}
									</span>
								</span>
							</button>
						</Marker>
					);
				})}

				{selectedIncident && (
					<Marker
						latitude={selectedIncident.lat}
						longitude={selectedIncident.lng}
						anchor={detailPlacement.anchor}
						offset={detailPlacement.offset}
					>
						<IncidentInfoCard
							incident={selectedIncident.incident}
							title={selectedIncident.title}
							lat={selectedIncident.lat}
							lng={selectedIncident.lng}
							typeIcon={selectedIncident.typeIcon}
							onClose={() => setSelectedIncident(null)}
						/>
					</Marker>
				)}

				{selectedResource && (
					<Marker
						latitude={selectedResource.lat}
						longitude={selectedResource.lng}
						anchor="top-left"
						offset={[14, 14]}
					>
						<div className="w-72 rounded-xl bg-white font-mono dark:bg-neutral-900 shadow-lg p-3 border border-zinc-200 dark:border-neutral-800">
							<div className="mb-2 flex items-center justify-between">
								<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
									Responder {selectedResource.callSign}
								</h3>
								<button
									type="button"
									onClick={() => setSelectedResource(null)}
									className="text-sm md:text-lg rounded-full bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 p-1 text-zinc-500"
								>
									<div className="i-lucide-x" />
								</button>
							</div>
							<div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
								<span className="text-zinc-500 dark:text-zinc-400">Driver</span>
								<span className="truncate">{selectedResource.driverName}</span>

								<span className="text-zinc-500 dark:text-zinc-400">Status</span>
								<span>{selectedResource.status.replace("_", " ")}</span>

								<span className="text-zinc-500 dark:text-zinc-400">Type</span>
								<span>{selectedResource.vehicleType.replace("_", " ")}</span>

								<span className="text-zinc-500 dark:text-zinc-400">
									Station
								</span>
								<span className="truncate">{selectedResource.stationName}</span>

								{selectedResource.incidentId && (
									<>
										<span className="text-zinc-500 dark:text-zinc-400">
											Incident
										</span>
										<span>{selectedResource.incidentId}</span>
									</>
								)}
							</div>
						</div>
					</Marker>
				)}

				{selectedStation && (
					<Marker
						latitude={selectedStation.lat}
						longitude={selectedStation.lng}
						anchor="top-left"
						offset={[14, 14]}
					>
						<div className="w-72 rounded-xl bg-white font-mono dark:bg-neutral-900 shadow-lg p-3 border border-zinc-200 dark:border-neutral-800">
							<div className="mb-2 flex items-center justify-between">
								<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
									{selectedStation.name}
								</h3>
								<button
									type="button"
									onClick={() => setSelectedStation(null)}
									className="text-sm md:text-lg rounded-full bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 p-1 text-zinc-500"
								>
									<div className="i-lucide-x" />
								</button>
							</div>
							<div className="grid grid-cols-[88px_1fr] gap-x-2 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
								<span className="text-zinc-500 dark:text-zinc-400">Type</span>
								<span className="capitalize">{selectedStation.type}</span>

								<span className="text-zinc-500 dark:text-zinc-400">
									Address
								</span>
								<span className="truncate" title={selectedStation.address}>
									{selectedStation.address}
								</span>

								<span className="text-zinc-500 dark:text-zinc-400">
									Responders
								</span>
								<span>{selectedStation.responderCount}</span>

								<span className="text-zinc-500 dark:text-zinc-400">
									Active Dispatches
								</span>
								<span>{selectedStation.activeDispatches}</span>
							</div>
						</div>
					</Marker>
				)}

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

				{searchPin && (
					<Marker
						latitude={searchPin.lat}
						longitude={searchPin.lng}
						style={{ background: "transparent" }}
					>
						<div className="flex flex-col items-center">
							<div className="relative flex size-10 items-center justify-center rounded-full bg-violet-600 shadow-lg ring-2 ring-white dark:ring-neutral-900">
								<div className="i-lucide-map-pin size-5 text-white" />
								{/* dismiss sits in the top-right corner of the pin bubble */}
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onSearchPinDismiss?.();
										setAddMenu(null);
									}}
									className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 border border-zinc-200 dark:border-neutral-700"
								>
									<div className="i-lucide-x size-4" />
								</button>
							</div>
							<div className="mt-1 max-w-[180px] truncate rounded-md bg-white px-2 py-0.5 text-[10px] font-medium shadow dark:bg-neutral-900 dark:text-zinc-200 border border-zinc-200 dark:border-neutral-700">
								{searchPin.address.split(",")[0]}
							</div>
						</div>
					</Marker>
				)}
			</MbMap>

			{addMenu && (
				<AddMenu
					position={{ x: addMenu.x, y: addMenu.y }}
					onAddIncident={() => {
						if (!onRequestIncidentAt) return;
						onRequestIncidentAt({
							lat: addMenu.lat,
							lng: addMenu.lng,
						});
						setAddMenu(null);
					}}
					onAddResource={() => {
						if (!onRequestResourceAt) return;
						onRequestResourceAt({
							lat: addMenu.lat,
							lng: addMenu.lng,
						});
						setAddMenu(null);
					}}
					onClose={() => setAddMenu(null)}
				/>
			)}
		</div>
	);
}

export default GeospyMap;
