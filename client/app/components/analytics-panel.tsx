import { useAtom } from "jotai";
import React from "react";
import { Drawer } from "vaul";
import { activePanelAtom } from "~/lib/store";

const snapPoints = [0.25, 0.5, 0.85] as const;

export function AnalyticsPanel() {
	const [activePanel, setActivePanel] = useAtom(activePanelAtom);
	const [snap, setSnap] = React.useState<number | string | null>(snapPoints[2]);

	return (
		<Drawer.Root
			open={activePanel === "analytics"}
			onOpenChange={(open) => {
				if (!open) setActivePanel(null);
			}}
			snapPoints={[...snapPoints]}
			activeSnapPoint={snap}
			setActiveSnapPoint={setSnap}
		>
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 bg-black/40 z-200" />
				<Drawer.Content className="fixed bottom-0 left-0 right-0 z-200 outline-none rounded-t-2xl bg-white dark:bg-neutral-900 border-t border-zinc-200 dark:border-neutral-800 h-full max-h-screen">
					<div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-neutral-700" />
					<div
						className="p-5 h-full"
						style={{
							overflowY:
								snap === snapPoints[snapPoints.length - 1] ? "auto" : "hidden",
						}}
					>
						<h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
							Analytics
						</h2>
						<div className="flex flex-col items-center justify-center gap-3 text-center py-12">
							<div className="i-solar-cloud-file-outline size-10 text-zinc-300 dark:text-neutral-600" />
							<div>
								<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
									No data yet
								</p>
								<p className="text-xs text-secondary mt-0.5">
									Analytics will appear as incidents are reported
								</p>
							</div>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
