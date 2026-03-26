import { useForm } from "react-hook-form";
import { Modal } from "~/components/modal";

const INCIDENT_TYPES = [
	{ code: "FIRE", category: "Natural" },
	{ code: "FLOOD", category: "Natural" },
	{ code: "ACCIDENT", category: "Traffic" },
	{ code: "MEDICAL", category: "Health" },
	{ code: "SECURITY", category: "Crime" },
] as const;

type FormValues = {
	// type
	typeCode: string;
	typeCategory: string;
	// description
	description: string;
	// location
	address: string;
	lat: number;
	lng: number;
	radius: number;
	// priority
	priorityLevel: "low" | "medium" | "high";
	// metadata
	citizenName: string;
	citizenPhone: string;
};

const inputClass =
	"w-full rounded-lg border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-neutral-600";

const labelClass =
	"block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1";

export function AddIncidentModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { register, handleSubmit, reset } = useForm<FormValues>({
		defaultValues: {
			priorityLevel: "medium",
			radius: 0,
		},
	});

	function onSubmit(data: FormValues) {
		const payload = {
			type: {
				code: data.typeCode,
				category: data.typeCategory || undefined,
			},
			description: data.description || undefined,
			location: {
				address: data.address,
				center: [data.lat, data.lng] as [number, number],
				radius: data.radius,
			},
			priority: {
				level: data.priorityLevel,
			},
			metadata: {
				citizenName: data.citizenName,
				citizenPhone: data.citizenPhone,
			},
		};

		console.log(payload); // replace with fetcher.submit or API call
	}

	function handleClose() {
		reset();
		onClose();
	}

	return (
		<Modal open={open} onClose={handleClose} className="w-full max-w-lg p-5">
			<h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
				New Incident Report
			</h4>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				{/* Citizen info */}
				<fieldset className="space-y-3">
					<legend className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
						Reporting Citizen
					</legend>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className={labelClass}>Full Name</label>
							<input
								{...register("citizenName", { required: true })}
								type="text"
								placeholder="John Doe"
								className={inputClass}
							/>
						</div>
						<div>
							<label className={labelClass}>Phone Number</label>
							<input
								{...register("citizenPhone")}
								type="tel"
								placeholder="+233 020 123 4567"
								className={inputClass}
							/>
						</div>
					</div>
				</fieldset>

				{/* Incident type */}
				<fieldset className="space-y-3">
					<legend className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
						Incident Type
					</legend>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className={labelClass}>Type</label>
							<select
								{...register("typeCode", { required: true })}
								className={inputClass}
							>
								<option value="">Select type</option>
								{INCIDENT_TYPES.map((t) => (
									<option key={t.code} value={t.code}>
										{t.code}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className={labelClass}>Category</label>
							<input
								{...register("typeCategory")}
								type="text"
								placeholder="e.g. Natural"
								className={inputClass}
							/>
						</div>
					</div>
				</fieldset>

				{/* Location */}
				<fieldset className="space-y-3">
					<legend className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
						Location
					</legend>
					<div>
						<label className={labelClass}>Address</label>
						<input
							{...register("address", { required: true })}
							type="text"
							placeholder="Street address or landmark"
							className={inputClass}
						/>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<div>
							<label className={labelClass}>Latitude</label>
							<input
								{...register("lat", { required: true, valueAsNumber: true })}
								type="number"
								step="any"
								placeholder="5.6148"
								className={inputClass}
							/>
						</div>
						<div>
							<label className={labelClass}>Longitude</label>
							<input
								{...register("lng", { required: true, valueAsNumber: true })}
								type="number"
								step="any"
								placeholder="-0.2059"
								className={inputClass}
							/>
						</div>
						<div>
							<label className={labelClass}>Radius (m)</label>
							<input
								{...register("radius", { valueAsNumber: true })}
								type="number"
								min="0"
								placeholder="0"
								className={inputClass}
							/>
						</div>
					</div>
				</fieldset>

				{/* Priority */}
				<fieldset className="space-y-3">
					<legend className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
						Priority
					</legend>
					<div className="flex gap-2">
						{(["low", "medium", "high"] as const).map((level) => (
							<label key={level} className="flex-1 cursor-pointer">
								<input
									{...register("priorityLevel")}
									type="radio"
									value={level}
									className="sr-only peer"
								/>
								<div
									className={`text-center rounded-lg px-3 py-2 text-sm font-medium border transition-colors
									peer-checked:border-transparent
									${level === "low" && "peer-checked:bg-emerald-100 peer-checked:text-emerald-800 dark:peer-checked:bg-emerald-900/40 dark:peer-checked:text-emerald-300"}
									${level === "medium" && "peer-checked:bg-amber-100 peer-checked:text-amber-800 dark:peer-checked:bg-amber-900/40 dark:peer-checked:text-amber-300"}
									${level === "high" && "peer-checked:bg-red-100 peer-checked:text-red-800 dark:peer-checked:bg-red-900/40 dark:peer-checked:text-red-300"}
									border-zinc-200 dark:border-neutral-700 text-zinc-600 dark:text-zinc-400
									hover:bg-zinc-50 dark:hover:bg-neutral-800
								`}
								>
									{level.charAt(0).toUpperCase() + level.slice(1)}
								</div>
							</label>
						))}
					</div>
				</fieldset>

				{/* Notes */}
				<div>
					<label className={labelClass}>Notes</label>
					<textarea
						{...register("description")}
						placeholder="Additional details about the incident..."
						className={`${inputClass} min-h-24 resize-none`}
					/>
				</div>

				<div className="flex justify-end gap-2 pt-1">
					<button
						type="button"
						onClick={handleClose}
						className="rounded-lg px-4 py-2 text-sm bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="rounded-lg px-4 py-2 text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity"
					>
						Create Incident
					</button>
				</div>
			</form>
		</Modal>
	);
}
