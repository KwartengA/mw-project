import type { AddItem } from "~/lib/types";
import { cn } from "~/lib/utils";

const addItems: {
	id: AddItem;
	label: string;
	icon: string;
	description: string;
}[] = [
	{
		id: "resource",
		label: "Resource",
		icon: "i-solar-box-linear",
		description: "Register a new resource",
	},
];

export function AddPanel({ onSelect }: { onSelect: (item: AddItem) => void }) {
	return (
		<aside className="w-72 rounded-xl bg-white font-mono dark:bg-neutral-900 shadow-lg p-3 border border-zinc-200 dark:border-neutral-800">
			<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
				Add new
			</h3>
			<div className="flex flex-col gap-2">
				{addItems.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => onSelect(item.id)}
						className="w-full text-left rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:hover:bg-neutral-800 dark:(bg-neutral-800 border-neutral-700) transition"
					>
						<div className="flex items-center gap-2">
							<div
								className={cn(
									item.icon,
									"size-5 text-zinc-700 dark:text-zinc-200",
								)}
							/>
							<div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
								{item.label}
							</div>
						</div>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							{item.description}
						</p>
					</button>
				))}
			</div>
		</aside>
	);
}
