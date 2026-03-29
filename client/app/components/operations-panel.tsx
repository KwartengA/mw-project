import React from "react";
import { AnalyticsPanel } from "./analytics-panel";
import { DashboardPanel } from "./dashboard.panel";

type OperationsPanelProps = {
	initialTab: "dashboard" | "analytics";
	onClose: () => void;
};

export function OperationsPanel({ initialTab, onClose }: OperationsPanelProps) {
	const [activeTab, setActiveTab] = React.useState<"dashboard" | "analytics">(
		initialTab,
	);

	React.useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	return (
		<div className="fixed inset-0 z-300 bg-zinc-50 dark:bg-neutral-950">
			<div className="h-full w-full overflow-y-auto">
				<header className="sticky top-0 z-10 font-mono bg-zinc-50/95 dark:bg-neutral-950/90 backdrop-blur border-b border-zinc-200 dark:border-neutral-800">
					<div className="mx-auto w-full max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
						<div className="min-w-0">
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
								Operations
							</p>
							<div className="mt-2 inline-flex rounded-xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1 gap-1">
								<button
									type="button"
									onClick={() => setActiveTab("dashboard")}
									className={
										activeTab === "dashboard"
											? "px-3 py-1.5 rounded-lg text-sm font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
											: "px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:(bg-neutral-900 hover:bg-neutral-800)"
									}
								>
									Dashboard
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("analytics")}
									className={
										activeTab === "analytics"
											? "px-3 py-1.5 rounded-lg text-sm font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
											: "px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:(bg-neutral-900 hover:bg-neutral-800)"
									}
								>
									Analytics
								</button>
							</div>
						</div>

						<button
							type="button"
							onClick={onClose}
							className="text-sm md:text-base rounded-full bg-zinc-200 dark:bg-neutral-900 hover:bg-zinc-300 dark:hover:bg-neutral-800 px-3 py-1.5 text-zinc-700 dark:text-zinc-200"
						>
							Close
						</button>
					</div>
				</header>

				<main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-5 md:py-8 space-y-6">
					{activeTab === "dashboard" && <DashboardPanel />}
					{activeTab === "analytics" && <AnalyticsPanel />}
				</main>
			</div>
		</div>
	);
}
