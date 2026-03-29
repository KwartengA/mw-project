import React from "react";
import { type TimeWindow, useAnalytics } from "~/lib/use-analytics";

function fmtMinutes(value: number | null | undefined) {
	if (typeof value !== "number" || !Number.isFinite(value)) return "-";
	return `${value.toFixed(2)} min`;
}

function windowLabel(value: TimeWindow) {
	if (value === "7d") return "Last 7 Days";
	if (value === "30d") return "Last 30 Days";
	return "Last 90 Days";
}

function serviceGlyph(service: string) {
	if (service === "ambulance") return "i-solar-ambulance-bold-duotone";
	if (service === "fire") return "i-solar-fire-bold-duotone";
	if (service === "police") return "i-solar-shield-keyhole-bold-duotone";
	return "i-solar-siren-bold-duotone";
}

export function AnalyticsPanel() {
	const [window, setWindow] = React.useState<TimeWindow>("30d");
	const {
		responseTimesQuery,
		incidentsByRegionQuery,
		resourceUtilizationQuery,
		isLoading,
		isError,
		error,
	} = useAnalytics(window);

	const incidentTypeShare = React.useMemo(() => {
		const grouped = new Map<string, number>();
		for (const row of incidentsByRegionQuery.data?.breakdown ?? []) {
			grouped.set(
				row.incidentType,
				(grouped.get(row.incidentType) ?? 0) + row.count,
			);
		}
		return Array.from(grouped.entries())
			.map(([incidentType, count]) => ({ incidentType, count }))
			.sort((a, b) => b.count - a.count);
	}, [incidentsByRegionQuery.data]);

	if (isLoading) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
				<div className="i-solar-refresh-bold-duotone size-10 text-zinc-300 dark:text-neutral-600 animate-spin" />
				<p className="text-sm text-secondary">Loading analytics...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
				<div className="i-solar-danger-bold-duotone size-10 text-rose-400" />
				<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					Analytics unavailable
				</p>
				<p className="text-xs text-secondary max-w-md">
					{error instanceof Error
						? error.message
						: "Please verify analytics service and gateway routes."}
				</p>
			</div>
		);
	}

	const bedUsage = resourceUtilizationQuery.data?.bedUsage;
	const topResponders =
		resourceUtilizationQuery.data?.topRespondersByService ?? {};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
						Analytics Intelligence
					</p>
					<p className="text-sm text-secondary">
						{windowLabel(window)} operational performance
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

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
				<section className="xl:col-span-2 rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						Response Time Distribution
					</h3>
					<div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
						{(responseTimesQuery.data?.byService ?? []).map((service) => (
							<div
								key={service.emergencyService}
								className="rounded-lg border border-zinc-200 dark:border-neutral-800 p-3"
							>
								<div className="flex items-center gap-2">
									<span
										className={`${serviceGlyph(service.emergencyService)} size-5 text-zinc-500`}
									/>
									<p className="text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-200">
										{service.emergencyService.replace("_", " ")}
									</p>
								</div>
								<div className="mt-3 space-y-1 text-xs text-secondary">
									<p className="flex items-center justify-between">
										<span>Average</span>
										<span className="font-medium text-zinc-800 dark:text-zinc-200">
											{fmtMinutes(service.avgMinutes)}
										</span>
									</p>
									<p className="flex items-center justify-between">
										<span>P50</span>
										<span className="font-medium text-zinc-800 dark:text-zinc-200">
											{fmtMinutes(service.p50Minutes)}
										</span>
									</p>
									<p className="flex items-center justify-between">
										<span>P95</span>
										<span className="font-medium text-zinc-800 dark:text-zinc-200">
											{fmtMinutes(service.p95Minutes)}
										</span>
									</p>
									<p className="flex items-center justify-between">
										<span>Arrival Rate</span>
										<span className="font-medium text-zinc-800 dark:text-zinc-200">
											{typeof service.arrivalRate === "number"
												? `${service.arrivalRate.toFixed(1)}%`
												: "-"}
										</span>
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						Hospital Capacity Pressure
					</h3>
					<div className="mt-3 rounded-lg border border-zinc-200 dark:border-neutral-800 p-3">
						<p className="text-xs text-secondary">Bed Usage</p>
						<p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
							{typeof bedUsage?.usageRatePercent === "number"
								? `${bedUsage.usageRatePercent.toFixed(1)}%`
								: "-"}
						</p>
						<div className="mt-2 h-2 rounded bg-zinc-100 dark:bg-neutral-800 overflow-hidden">
							<div
								className="h-full bg-emerald-500"
								style={{
									width: `${Math.max(0, Math.min(100, bedUsage?.usageRatePercent ?? 0))}%`,
								}}
							/>
						</div>
						<div className="mt-2 text-[11px] text-secondary">
							<p>Total Beds: {bedUsage?.totalBeds ?? 0}</p>
							<p>Available Beds: {bedUsage?.availableBeds ?? 0}</p>
							<p>Used Beds: {bedUsage?.usedBeds ?? 0}</p>
						</div>
					</div>
					<div className="mt-2 text-[11px] text-secondary">
						Hospitals considered:{" "}
						{resourceUtilizationQuery.data?.hospitalsConsidered ?? 0}
					</div>
				</section>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
				<section className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						Incident Type Mix
					</h3>
					<div className="mt-3 space-y-2">
						{incidentTypeShare.length === 0 && (
							<p className="text-xs text-secondary">
								No incident distribution for selected range.
							</p>
						)}
						{incidentTypeShare.map((row) => {
							const total = incidentsByRegionQuery.data?.totalIncidents ?? 0;
							const pct = total > 0 ? (row.count / total) * 100 : 0;
							return (
								<div key={row.incidentType}>
									<div className="flex items-center justify-between text-xs">
										<span className="text-zinc-700 dark:text-zinc-200">
											{row.incidentType}
										</span>
										<span className="text-secondary">{row.count}</span>
									</div>
									<div className="h-2 rounded bg-zinc-100 dark:bg-neutral-800 mt-1 overflow-hidden">
										<div
											className="h-full bg-zinc-700 dark:bg-zinc-200"
											style={{ width: `${pct}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				<section className="rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						Top Responders By Service
					</h3>
					<div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
						{Object.entries(topResponders).length === 0 && (
							<p className="text-xs text-secondary">
								No responder deployment data available.
							</p>
						)}
						{Object.entries(topResponders).map(([service, rows]) => (
							<div
								key={service}
								className="rounded-lg border border-zinc-200 dark:border-neutral-800 p-2.5"
							>
								<p className="text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-200 mb-1.5">
									{service.replace("_", " ")}
								</p>
								<ul className="space-y-1">
									{rows.map((row) => (
										<li
											key={`${service}-${row.responderId}`}
											className="flex items-center justify-between gap-2 text-xs"
										>
											<span className="truncate text-zinc-700 dark:text-zinc-200">
												{row.responderName ?? `Responder ${row.responderId}`}
											</span>
											<span className="text-secondary">
												{row.deployments} deployments
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
