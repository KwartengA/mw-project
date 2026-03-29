import { useAtom } from "jotai";
import { activePanelAtom } from "~/lib/store";
import { useIncidents } from "~/lib/use-incidents";

export const IncidentWidget = () => {
	const [, setActivePanel] = useAtom(activePanelAtom);

	const { items: incidents } = useIncidents({ limit: 100 });
	const count = incidents.filter(
		(incident) => !["resolved", "cancelled"].includes(incident.status),
	).length;

	return (
		<div className="relative mt-2">
			<button
				onClick={() => setActivePanel("incidents")}
				type="button"
				title={`${count} active incidents`}
				className="relative size-[2.25rem] rounded-full"
			>
				<svg className="h-full w-full" viewBox="0 0 100 100">
					<title>{`${count} active incidents`}</title>
					<circle
						className="text-black/10 dark:text-white/30 stroke-current"
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
						{count}
					</text>
				</svg>
			</button>
		</div>
	);
};
