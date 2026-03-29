import React from "react";
import { useAnalytics, type TimeWindow } from "~/lib/use-analytics";
import { useDispatchResources } from "~/lib/use-dispatch";
import { useIncidents } from "~/lib/use-incidents";

function serviceTone(service: string) {
	if (service === "ambulance") return "bg-blue-500";
	if (service === "fire") return "bg-orange-500";
	if (service === "police") return "bg-indigo-500";
	return "bg-zinc-500";
}

function statusBucket(status: string) {
	if (status === "created") return "Created";
	if (status === "dispatched") return "Dispatched";
	if (status === "in_progress") return "In Progress";
	if (status === "resolved") return "Resolved";
	if (status === "cancelled") return "Cancelled";
	return "Other";
}

function fmtMinutes(value: number | null | undefined) {
	if (typeof value !== "number" || !Number.isFinite(value)) return "-";
	return `${value.toFixed(1)}m`;
}

function windowLabel(value: TimeWindow) {
	if (value === "7d") return "7 days";
	if (value === "30d") return "30 days";
	return "90 days";
}

export function DashboardPanel() {
	const [window, setWindow] = React.useState<TimeWindow>("30d");
	const { items: incidents, isLoading: incidentsLoading } = useIncidents({
		limit: 300,
	});
	const {
		vehicles,
		activeDispatches,
		isLoading: resourcesLoading,
	} = useDispatchResources();
	const { responseTimesQuery, incidentsByRegionQuery, isLoading, isError, error } =
		useAnalytics(window);

	const statusCounts = React.useMemo(() => {
		const map = new Map<string, number>();
		for (const incident of incidents) {
			const key = statusBucket(incident.status);
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	}, [incidents]);

	const respondersAvailable = vehicles.filter(
		(vehicle) => vehicle.status === "available",
	).length;

	const openIncidents = incidents.filter(
		(incident) => !["resolved", "cancelled"].includes(incident.status),
	).length;

	const topRegions = React.useMemo(() => {
		const rows = incidentsByRegionQuery.data?.breakdown ?? [];
		const grouped = new Map<string, number>();
		for (const item of rows) {
			grouped.set(item.region, (grouped.get(item.region) ?? 0) + item.count);
		}
		return Array.from(grouped.entries())
			.map(([region, count]) => ({ region, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}, [incidentsByRegionQuery.data]);

	if (isLoading || incidentsLoading || resourcesLoading) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
				<div className="i-solar-refresh-bold-duotone size-10 text-zinc-300 dark:text-neutral-600 animate-spin" />
				<p className="text-sm text-secondary">Loading dashboard...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
				<div className="i-solar-danger-bold-duotone size-10 text-rose-400" />
				<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					Unable to load dashboard metrics
				</p>
				<p className="text-xs text-secondary max-w-md">
					{error instanceof Error
						? error.message
						: "Please verify analytics service connectivity."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
						Command View
					</p>
					<p className="text-sm text-secondary">
						Live operations and recent response behavior
					</p>
				</div>
				<div className="inline-flex rounded-lg border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1 gap-1">
					{(["7d", "30d", "90d"] as TimeWindow[]).map((value) => (
						<button
							key={value}
							type="button"
							onClick={() => setWindow(value)}
							className={
								window === value
									? "px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
									: "px-2.5 py-1 rounded-md text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-neutral-800"
							}
						>
							{value.toUpperCase()}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
				<div className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<p className="text-[11px] uppercase tracking-wide text-secondary">Open Incidents</p>
					<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{openIncidents}</p>
				</div>
				<div className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<p className="text-[11px] uppercase tracking-wide text-secondary">Active Dispatches</p>
					<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{activeDispatches.length}</p>
				</div>
				<div className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<p className="text-[11px] uppercase tracking-wide text-secondary">Responders Available</p>
					<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{respondersAvailable}</p>
				</div>
				<div className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<p className="text-[11px] uppercase tracking-wide text-secondary">Avg Response ({windowLabel(window)})</p>
					<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
						{fmtMinutes(responseTimesQuery.data?.overall.avgMinutes)}
					</p>
				</div>
				<div className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<p className="text-[11px] uppercase tracking-wide text-secondary">Total Dispatches</p>
					<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
						{responseTimesQuery.data?.overall.totalDispatches ?? 0}
					</p>
				</div>
				<div className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3">
					<p className="text-[11px] uppercase tracking-wide text-secondary">Arrived Units</p>
					<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
						{responseTimesQuery.data?.overall.totalArrived ?? 0}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
				<section className="xl:col-span-2 rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Response Time By Service</h3>
						<p className="text-xs text-secondary">P95 shows worst-case tail</p>
					</div>
					<div className="mt-3 space-y-2">
						{(responseTimesQuery.data?.byService ?? []).map((row) => {
							const cap = Math.max(1, row.p95Minutes ?? row.avgMinutes ?? 1);
							const avgWidth = `${Math.min(100, ((row.avgMinutes ?? 0) / cap) * 100)}%`;
							const p95Width = `${Math.min(100, ((row.p95Minutes ?? 0) / cap) * 100)}%`;

							return (
								<div key={row.emergencyService} className="rounded-lg border border-zinc-200 dark:border-neutral-800 p-2.5">
									<div className="flex items-center justify-between text-xs">
										<p className="font-medium capitalize text-zinc-800 dark:text-zinc-200">{row.emergencyService.replace("_", " ")}</p>
										<p className="text-secondary">{row.totalArrived}/{row.totalDispatches} arrived</p>
									</div>
									<div className="mt-2 space-y-1.5">
										<div>
											<div className="flex items-center justify-between text-[11px] text-secondary">
												<span>Average</span>
												<span>{fmtMinutes(row.avgMinutes)}</span>
											</div>
											<div className="h-2 rounded bg-zinc-100 dark:bg-neutral-800 mt-1 overflow-hidden">
												<div className={`h-full ${serviceTone(row.emergencyService)}`} style={{ width: avgWidth }} />
											</div>
										</div>
										<div>
											<div className="flex items-center justify-between text-[11px] text-secondary">
												<span>P95</span>
												<span>{fmtMinutes(row.p95Minutes)}</span>
											</div>
											<div className="h-2 rounded bg-zinc-100 dark:bg-neutral-800 mt-1 overflow-hidden">
												<div className={`h-full ${serviceTone(row.emergencyService)} opacity-60`} style={{ width: p95Width }} />
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<section className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Incident Status Mix</h3>
					<div className="mt-3 space-y-2">
						{Array.from(statusCounts.entries()).map(([label, count]) => {
							const pct = incidents.length > 0 ? (count / incidents.length) * 100 : 0;
							return (
								<div key={label}>
									<div className="flex items-center justify-between text-xs">
										<span className="text-zinc-700 dark:text-zinc-200">{label}</span>
										<span className="text-secondary">{count}</span>
									</div>
									<div className="h-2 rounded bg-zinc-100 dark:bg-neutral-800 mt-1 overflow-hidden">
										<div className="h-full bg-zinc-700 dark:bg-zinc-200" style={{ width: `${pct}%` }} />
									</div>
								</div>
							);
						})}
					</div>
				</section>
			</div>

			<section className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Top Regions ({windowLabel(window)})</h3>
				<div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
					{topRegions.length === 0 && (
						<p className="text-xs text-secondary">No incidents recorded for selected range.</p>
					)}
					{topRegions.map((region) => (
						<div key={region.region} className="rounded-lg border border-zinc-200 dark:border-neutral-800 p-2.5">
							<p className="text-xs text-secondary truncate">{region.region}</p>
							<p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">{region.count}</p>
							<p className="text-[11px] text-secondary">incidents</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
