import { useLoadScript } from "@react-google-maps/api";
import React from "react";
import { useForm } from "react-hook-form";
import { Modal } from "~/components/modal";
import { reverseGeocode } from "~/lib/google";
import type {
	CreateStationPayload,
	DispatchStationType,
} from "~/lib/types/dispatch/model";
import { useDispatchResources } from "~/lib/use-dispatch";

const inputClass =
	"w-full rounded-lg border border-zinc-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-neutral-600";

const labelClass =
	"block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1";

type StationFormData = Omit<CreateStationPayload, "location"> & {
	address: string;
	lat: number;
	lng: number;
};

function stationTypeLabel(type: DispatchStationType) {
	if (type === "ambulance") return "Ambulance";
	if (type === "fire") return "Fire";
	return "Police";
}

export function AddResourceModal({
	open,
	onClose,
	initialLatLng,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	initialLatLng?: { lat: number; lng: number };
	onCreated?: (coords: { lat: number; lng: number }) => void;
}) {
	const { create } = useDispatchResources(false);
	const { isLoaded: isGoogleLoaded } = useLoadScript({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: ["places"],
	});
	const [isResolvingAddress, setIsResolvingAddress] = React.useState(false);
	const { register, handleSubmit, reset, setValue } = useForm<StationFormData>({
		defaultValues: {
			name: "",
			type: "ambulance",
			address: "",
			respondersCount: 4,
			lat: initialLatLng?.lat ?? 0,
			lng: initialLatLng?.lng ?? 0,
		},
	});

	React.useEffect(() => {
		if (!open || !initialLatLng) return;
		setValue("lat", Number(initialLatLng.lat.toFixed(6)));
		setValue("lng", Number(initialLatLng.lng.toFixed(6)));

		if (!isGoogleLoaded) {
			setValue(
				"address",
				`Pinned at ${initialLatLng.lat.toFixed(5)}, ${initialLatLng.lng.toFixed(5)}`,
			);
			return;
		}

		let isMounted = true;
		setIsResolvingAddress(true);

		(async () => {
			try {
				const address = await reverseGeocode(
					initialLatLng.lng,
					initialLatLng.lat,
				);
				if (!isMounted) return;
				setValue("address", address || "");
			} catch {
				if (!isMounted) return;
				setValue(
					"address",
					`Pinned at ${initialLatLng.lat.toFixed(5)}, ${initialLatLng.lng.toFixed(5)}`,
				);
			} finally {
				if (isMounted) {
					setIsResolvingAddress(false);
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [initialLatLng, isGoogleLoaded, open, setValue]);

	function closeAndReset() {
		reset();
		onClose();
	}

	function onSubmit(data: StationFormData) {
		const payload: CreateStationPayload = {
			name: data.name,
			type: data.type,
			respondersCount: data.respondersCount,
			location: {
				address: data.address,
				lat: data.lat,
				lng: data.lng,
			},
		};

		create.mutate(payload, {
			onSuccess: () => {
				onCreated?.({ lat: data.lat, lng: data.lng });
				closeAndReset();
			},
		});
	}

	return (
		<Modal open={open} onClose={closeAndReset} className="w-full max-w-lg p-5">
			<h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
				Create Station
			</h4>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className={labelClass}>Station Name</label>
						<input
							{...register("name", { required: true })}
							type="text"
							placeholder="Airport Fire Station"
							className={inputClass}
						/>
					</div>
					<div>
						<label className={labelClass}>Station Type</label>
						<select
							{...register("type", { required: true })}
							className={inputClass}
						>
							{(["ambulance", "fire", "police"] as const).map((type) => (
								<option key={type} value={type}>
									{stationTypeLabel(type)}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className={labelClass}>Address</label>
					<input
						{...register("address", { required: true })}
						type="text"
						placeholder="Ring Road Central, Accra"
						className={inputClass}
					/>
					{isResolvingAddress && (
						<p className="mt-1 text-xs text-secondary">Resolving address...</p>
					)}
				</div>

				<div className="grid grid-cols-3 gap-3">
					<div>
						<label className={labelClass}>Responders</label>
						<select
							{...register("respondersCount", {
								required: true,
								setValueAs: (value: string) => Number(value),
							})}
							className={inputClass}
						>
							<option value={3}>3</option>
							<option value={4}>4</option>
						</select>
					</div>
					<div>
						<label className={labelClass}>Latitude</label>
						<input
							{...register("lat", { required: true, valueAsNumber: true })}
							type="number"
							step="any"
							className={inputClass}
							disabled
						/>
					</div>
					<div>
						<label className={labelClass}>Longitude</label>
						<input
							{...register("lng", { required: true, valueAsNumber: true })}
							type="number"
							step="any"
							className={inputClass}
							disabled
						/>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-1">
					<button
						type="button"
						onClick={closeAndReset}
						className="rounded-lg px-4 py-2 text-sm bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={create.isPending}
						className="rounded-lg px-4 py-2 text-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity"
					>
						{create.isPending ? "Provisioning..." : "Create Station"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
