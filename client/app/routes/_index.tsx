import type { MetaFunction } from "react-router";
import GeospyMap from "~/components/map";

export const meta: MetaFunction = () => {
	return [
		{ title: "Welcome to Greatness" },
		{ name: "description", content: "Just do it!" },
	];
};

export default function Index() {
	return (
		<div className="h-screen flex flex-col">
			<div className="h-full h-0 flex-1 relative">
				<GeospyMap initialLatLng={{ lat: 5.614818, lng: -0.205874 }} />
			</div>
		</div>
	);
}
