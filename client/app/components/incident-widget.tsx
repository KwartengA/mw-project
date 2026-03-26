import { useAtom } from "jotai";
import { useState } from "react";
import { activePanelAtom } from "~/lib/store";

export const IncidentWidget = () => {
	const [showDropdown, setShowDropdown] = useState(false);
	const [, setActivePanel] = useAtom(activePanelAtom);

	return (
		<div className="relative mt-2">
			<button
				onClick={() => setActivePanel("incidents")}
				type="button"
				title="Active incidents"
				className="relative size-[2.25rem] rounded-full"
				onMouseEnter={() => setShowDropdown(true)}
				onMouseLeave={() => setShowDropdown(false)}
				onFocus={() => setShowDropdown(true)}
				onBlur={() => setShowDropdown(false)}
			>
				<svg className="h-full w-full" viewBox="0 0 100 100">
					<title>Active incidents</title>
					<circle
						className="text-black/10 dark:text-white/20 stroke-current"
						strokeWidth="12"
						cx="50"
						cy="50"
						r="40"
						fill="transparent"
					/>
					<circle
						className="text-black dark:text-white stroke-current"
						strokeWidth="12"
						strokeLinecap="round"
						cx="50"
						cy="50"
						r="40"
						fill="transparent"
						strokeDasharray="251.2"
						strokeDashoffset="251.2"
					/>
					<text
						x="50"
						y="50"
						fontSize="30px"
						fontWeight={700}
						textAnchor="middle"
						alignmentBaseline="middle"
						className="fill-black dark:fill-white"
					>
						0
					</text>
				</svg>
			</button>

			{showDropdown && (
				<div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 z-50">
					<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
						Active Incidents
					</p>
					<div className="mt-3 flex flex-col items-center gap-2 py-4 text-center">
						<div className="i-solar-folder-path-connect-linear size-7 text-zinc-300 dark:text-neutral-600" />
						<p className="text-xs text-secondary">No active incidents</p>
					</div>
				</div>
			)}
		</div>
	);
};
