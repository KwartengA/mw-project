import { useSetAtom } from "jotai";
import React from "react";
import { resourceFocusRequestAtom } from "~/lib/store";
import { useDispatchResources } from "~/lib/use-dispatch";

const statusClass: Record<string, string> = {
	available:
		"bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/70 dark:text-emerald-300 dark:border-emerald-700/50",
	dispatched:
		"bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-700/50",
	en_route:
		"bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/70 dark:text-cyan-300 dark:border-cyan-700/50",
	on_scene:
		"bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/70 dark:text-violet-300 dark:border-violet-700/50",
	returning:
		"bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/70 dark:text-amber-300 dark:border-amber-700/50",
	offline:
		"bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-neutral-800 dark:text-zinc-300 dark:border-neutral-700",
};

export function ResourcesPanel() {
	const { vehicles, activeDispatches, isLoading, arrive, seed } =
		useDispatchResources();
	const requestResourceFocus = useSetAtom(resourceFocusRequestAtom);
	const [expandedStationId, setExpandedStationId] = React.useState<
		number | null
	>(null);

	const activeDispatchByVehicleId = React.useMemo(() => {
		return new Map(activeDispatches.map((item) => [item.vehicleId, item]));
	}, [activeDispatches]);

	const stationGroups = React.useMemo(() => {
		const grouped = new Map<
			number,
			{
				stationId: number;
				stationName: string;
				stationType: string;
				vehicles: typeof vehicles;
			}
		>();

		for (const vehicle of vehicles) {
			if (!vehicle.stationId) continue;

			const existing = grouped.get(vehicle.stationId);
			if (existing) {
				existing.vehicles.push(vehicle);
				continue;
			}

			grouped.set(vehicle.stationId, {
				stationId: vehicle.stationId,
				stationName: vehicle.station?.name ?? `Station #${vehicle.stationId}`,
				stationType: vehicle.station?.type ?? "unknown",
				vehicles: [vehicle],
			});
		}

		return Array.from(grouped.values()).sort((a, b) =>
			a.stationName.localeCompare(b.stationName),
		);
	}, [vehicles]);

	const stationHealth = React.useMemo(() => {
		return stationGroups.map((station) => {
			const totals = {
				available: 0,
				dispatched: 0,
				en_route: 0,
				on_scene: 0,
				returning: 0,
				offline: 0,
				activeDispatches: 0,
			};

			for (const vehicle of station.vehicles) {
				totals[vehicle.status] += 1;
				if (activeDispatchByVehicleId.has(vehicle.id)) {
					totals.activeDispatches += 1;
				}
			}

			return {
				...station,
				...totals,
				total: station.vehicles.length,
			};
		});
	}, [activeDispatchByVehicleId, stationGroups]);

	if (isLoading) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
				<div className="i-solar-refresh-bold-duotone size-10 text-zinc-300 dark:text-neutral-600 animate-spin" />
				<p className="text-sm text-secondary">Loading resources...</p>
			</div>
		);
	}

	if (vehicles.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-4 text-center py-8">
				<div className="i-solar-database-bold-duotone size-10 text-zinc-300 dark:text-neutral-600" />
				<div>
					<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
						No responders yet
					</p>
					<p className="text-xs text-secondary mt-0.5">
						Create a station or use a demo seed reset
					</p>
				</div>
				<button
					type="button"
					onClick={() => seed.mutate({ reset: true, profile: "full" })}
					disabled={seed.isPending}
					className="rounded-lg px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-60"
				>
					{seed.isPending ? "Seeding..." : "Seed Demo Stations"}
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<p className="text-xs text-secondary">
					{activeDispatches.length}  / {vehicles.length}{" "}
					active dispatches
				</p>
				<button
					type="button"
					onClick={() => seed.mutate({ reset: true, profile: "full" })}
					disabled={seed.isPending}
					className="rounded-md px-2.5 py-1 text-[11px] font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-60"
				>
					{seed.isPending ? "Seeding..." : "Reset Demo"}
				</button>
			</div>

			<div className="grid grid-cols-1 gap-2">
				{stationHealth.map((station) => {
					const isExpanded = expandedStationId === station.stationId;

					return (
						<div
							key={station.stationId}
							className="rounded-xl border border-zinc-200 dark:border-neutral-800 overflow-hidden"
						>
							<button
								type="button"
								onClick={() =>
									setExpandedStationId(isExpanded ? null : station.stationId)
								}
								className="w-full text-left px-3 py-2.5 bg-white dark:bg-neutral-900 hover:bg-zinc-50 dark:hover:bg-neutral-800"
							>
								<div className="flex items-center justify-between gap-2">
									<div>
										<p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
											{station.stationName}
										</p>
										<p className="text-[11px] text-secondary capitalize">
											{station.stationType} station
										</p>
									</div>
									<div className="text-right">
										<p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
											{station.total} responders
										</p>
										<p className="text-[11px] text-secondary">
											{station.activeDispatches} active dispatches
										</p>
									</div>
								</div>

								<div className="mt-2 grid grid-cols-4 gap-1 text-[10px]">
									<span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-center dark:bg-emerald-900/40 dark:text-emerald-300">
										A {station.available}
									</span>
									<span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-center dark:bg-blue-900/40 dark:text-blue-300">
										M{" "}
										{station.dispatched + station.en_route + station.returning}
									</span>
									<span className="rounded bg-violet-50 text-violet-700 px-1.5 py-0.5 text-center dark:bg-violet-900/40 dark:text-violet-300">
										S {station.on_scene}
									</span>
									<span className="rounded bg-zinc-100 text-zinc-700 px-1.5 py-0.5 text-center dark:bg-neutral-800 dark:text-zinc-300">
										O {station.offline}
									</span>
								</div>
							</button>

							{isExpanded && (
								<ul className="divide-y divide-zinc-200 dark:divide-neutral-800">
									{station.vehicles.map((vehicle) => {
										const activeDispatch = activeDispatchByVehicleId.get(
											vehicle.id,
										);
										const markerStatus = vehicle.status;
										const canArrive = Boolean(
											activeDispatch && markerStatus !== "on_scene",
										);

										return (
											// biome-ignore lint/a11y/useKeyWithClickEvents: list item works as a map focus trigger
											<li
												key={vehicle.id}
												className="group flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-900 hover:bg-zinc-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
												onClick={() =>
													requestResourceFocus({
														vehicleId: vehicle.id,
														requestId: Date.now(),
													})
												}
											>
												<span className="shrink-0 inline-flex size-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-neutral-800 dark:text-zinc-200">
													<span className="i-solar-users-group-two-rounded-bold-duotone size-4" />
												</span>

												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-1.5">
														<span
															className={`inline-flex rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${statusClass[markerStatus] ?? statusClass.offline}`}
														>
															{markerStatus.replace("_", " ")}
														</span>
														<span className="text-[11px] text-zinc-400 dark:text-zinc-500">
															{vehicle.callSign}
														</span>
													</div>
													<p className="mt-0.5 text-[11px] text-secondary truncate">
														{vehicle.driver?.name ?? "No driver assigned"}
														{activeDispatch
															? ` • incident ${activeDispatch.incidentId}`
															: ""}
													</p>
												</div>

												{canArrive && (
													<button
														type="button"
														onClick={(event) => {
															event.stopPropagation();
															if (!activeDispatch) return;
															arrive.mutate({ id: activeDispatch.id });
														}}
														disabled={arrive.isPending}
														className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
													>
														Arrived
													</button>
												)}
											</li>
										);
									})}
								</ul>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
