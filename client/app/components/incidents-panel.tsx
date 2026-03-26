export function IncidentsPanel() {
	return (
		<div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
			<div className="i-solar-folder-path-connect-linear size-10 text-zinc-300 dark:text-neutral-600" />
			<div>
				<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					No incidents yet
				</p>
				<p className="text-xs text-secondary mt-0.5">
					Click on the map to report one
				</p>
			</div>
		</div>
	);
}
