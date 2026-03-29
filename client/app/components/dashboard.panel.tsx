export function DashboardPanel() {
	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
			<div className="i-solar-code-scan-bold size-10 text-zinc-300 dark:text-neutral-600" />
			<div>
				<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					No data yet
				</p>
				<p className="text-xs text-secondary mt-0.5">
					Dashboard insights will appear as incidents are reported
				</p>
			</div>
		</div>
	);
}
