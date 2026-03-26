import { Modal } from "~/components/modal";

export function AddResourceModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Modal open={open} onClose={onClose} className="w-full max-w-lg p-4">
			<div className="space-y-3">
				<h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
					Add Resource
				</h4>
				<input
					type="text"
					placeholder="Resource name"
					className="w-full rounded-lg border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
				/>
				<input
					type="text"
					placeholder="Type (e.g. Ambulance, Truck)"
					className="w-full rounded-lg border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
				/>
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg px-3 py-2 text-sm bg-zinc-100 dark:bg-neutral-800"
					>
						Cancel
					</button>
					<button
						type="button"
						className="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white"
					>
						Create Resource
					</button>
				</div>
			</div>
		</Modal>
	);
}
