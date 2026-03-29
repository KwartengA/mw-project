import { useAtom } from "jotai";
import { activePanelAtom } from "~/lib/store";
import { useIncidents } from "~/lib/use-incidents";

const CIRCUMFERENCE = 2 * Math.PI * 40; 

export const IncidentWidget = () => {
	const [, setActivePanel] = useAtom(activePanelAtom);
	const { items: incidents } = useIncidents({ limit: 100 });

	const active = incidents.filter(
		(incident) => !["resolved", "cancelled"].includes(incident.status),
	).length;
	const total = incidents.length;

	const ratio = total > 0 ? active / total : 0;
	const offset = CIRCUMFERENCE * (1 - ratio);

	return (
		<div className="relative mt-2">
			<button
				onClick={() => setActivePanel("incidents")}
				type="button"
				title={`${active} of ${total} incidents active`}
				className="relative size-[2.25rem] rounded-full"
			>
				<svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
					<title>{`${active} of ${total} incidents active`}</title>
					{/* Track */}
					<circle
						className="text-black/10 dark:text-white/20 stroke-current"
						strokeWidth="12"
						cx="50"
						cy="50"
						r="40"
						fill="transparent"
					/>
					{/* Fill */}
					<circle
						className="stroke-current transition-all duration-500"
						style={{
							color:
								active === 0
									? "transparent"
									: active / total > 0.6
										? "#ef4444"
										: "#f97316",
						}}
						strokeWidth="12"
						strokeLinecap="round"
						cx="50"
						cy="50"
						r="40"
						fill="transparent"
						strokeDasharray={CIRCUMFERENCE}
						strokeDashoffset={offset}
					/>
				</svg>
				{/* Count label — outside SVG so it isn't rotated */}
				<span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-black dark:text-white leading-none">
					{active}
				</span>
			</button>
		</div>
	);
};
