export function ResourcesPanel() {
	return (
		<div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
			<div className="i-solar-database-bold-duotone size-10 text-zinc-300 dark:text-neutral-600" />
			<div>
				<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
					No resources yet
				</p>
				<p className="text-xs text-secondary mt-0.5">
					Add a resource to get started
				</p>
			</div>
		</div>
	);
}
