import {
	FloatingFocusManager,
	FloatingPortal,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListNavigation,
} from "@floating-ui/react";
import { useLoadScript } from "@react-google-maps/api";
import clsx from "clsx";
import React from "react";
import { Input } from "~/components/input";
import {
	type AutocompletePrediction,
	getLocationSuggestions,
	getPlaceDetails,
} from "~/lib/google";
import { useDebounce } from "~/lib/use-debounce";

interface LocationSearchProps {
	onLocationSelect: (coordinates: [number, number], address: string) => void;
}

const LIBRARIES: ["places"] = ["places"];

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
	const [query, setQuery] = React.useState("");
	const [results, setResults] = React.useState<AutocompletePrediction[]>([]);
	const [open, setOpen] = React.useState(false);
	const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | undefined>(undefined);
	const listRef = React.useRef<HTMLElement[]>([]);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const selectedRef = React.useRef(false);

	const debouncedQuery = useDebounce(query, 300);

	const { isLoaded } = useLoadScript({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: LIBRARIES,
	});

	const fetchSuggestions = React.useCallback(
		async (searchQuery: string) => {
			if (!isLoaded || !searchQuery.trim()) return;

			try {
				setIsLoading(true);
				setError(undefined);

				const suggestions = await getLocationSuggestions(searchQuery);

				if (!suggestions.length) {
					setResults([]);
					setError("No results found");
					return;
				}

				setResults(suggestions);
				setOpen(true);
			} catch (error) {
				setError("Failed to search location");
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		},
		[isLoaded],
	);

	React.useEffect(() => {
		if (selectedRef.current) {
			selectedRef.current = false;
			return;
		}

		if (!debouncedQuery.trim()) {
			setResults([]);
			setOpen(false);
			return;
		}

		fetchSuggestions(debouncedQuery);
	}, [debouncedQuery, fetchSuggestions]);

	const handleSelect = React.useCallback(
		async (result: AutocompletePrediction) => {
			if (!isLoaded || !result.place_id) return;

			try {
				const place = await getPlaceDetails(result.place_id);

				if (!place.geometry?.location || !place.formatted_address) return;

				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();

				const address = place.formatted_address;

				onLocationSelect([lng, lat], address);

				selectedRef.current = true;
				setQuery(address);
				setOpen(false);
				setActiveIndex(null);
				inputRef.current?.focus();
			} catch (error) {}
		},
		[isLoaded, onLocationSelect],
	);

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: (isOpen) => {
			setOpen(isOpen);
			if (!isOpen) {
				setActiveIndex(null);
			}
		},
		placement: "bottom-start",
	});

	const click = useClick(context);
	const dismiss = useDismiss(context, {
		outsidePress: true,
		escapeKey: true,
	});

	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
		loop: true,
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
		[click, dismiss, listNavigation],
	);

	const handleInputChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setQuery(e.target.value);
		},
		[],
	);

	const dropdownWidth = React.useMemo(
		() => refs.domReference.current?.offsetWidth,
		[refs.domReference.current],
	);

	return (
		<div className="relative w-full z-10">
			<div className="flex gap-2">
				<Input
					type="text"
					placeholder="Search for a location"
					value={query}
					onChange={handleInputChange}
					className="w-full bg-white"
					aria-autocomplete="list"
					ref={inputRef}
					{...getReferenceProps({
						ref: refs.setReference,
					})}
				/>
			</div>

			<FloatingPortal>
				{open && (
					<FloatingFocusManager
						context={context}
						modal={false}
						initialFocus={-1}
					>
						<div className="relative">
							<ul
								{...getFloatingProps({
									ref: refs.setFloating,
									style: {
										...floatingStyles,
										zIndex: 999,
										width: dropdownWidth,
									},
									className: clsx(
										"bg-white border-1 border-neutral-300 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1",
										"dark:bg-neutral-800 dark:border-neutral-600 dark:text-zinc-100",
									),
								})}
							>
								{error ? (
									<li className="p-2 text-gray-500 dark:text-gray-400 text-sm">
										{error}
									</li>
								) : isLoading ? (
									<li className="p-2 flex items-center justify-center">
										<div className="i-svg-spinners-270-ring" />
									</li>
								) : query.trim() && results.length === 0 ? (
									<li className="p-2 text-gray-500 dark:text-gray-400 text-sm">
										No results found
									</li>
								) : (
									results.map((result, index) => (
										<li
											key={result.place_id}
											className={clsx(
												"p-2 cursor-pointer hover:bg-stone-100 dark:hover:bg-neutral-700/50",
												index !== 0 &&
													"border-t border-stone-200 dark:border-stone-600",
												activeIndex === index &&
													"bg-stone-100 dark:bg-stone-700",
											)}
											{...getItemProps({
												ref(node) {
													listRef.current[index] = node as HTMLElement;
												},
												onClick() {
													handleSelect(result);
												},
											})}
											aria-selected={activeIndex === index}
										>
											{result.description}
										</li>
									))
								)}
							</ul>
						</div>
					</FloatingFocusManager>
				)}
			</FloatingPortal>
		</div>
	);
}

export default React.memo(LocationSearch);
