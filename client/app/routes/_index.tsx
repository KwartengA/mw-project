import { tryit } from "radashi";
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
} from "react-router";
import GeospyMap from "~/components/map";
import { Navbar } from "~/components/navbar";
import Navigation from "~/components/navigation";
import { checkAuth } from "~/lib/check-auth";

export const meta: MetaFunction = () => {
	return [
		{ title: "Welcome to Greatness" },
		{ name: "description", content: "Just do it!" },
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [err] = await tryit(checkAuth)(request);

	if (err) {
		throw redirect("/login");
	}
};

export default function Index() {
	return (
		<div className="h-screen flex flex-col">
			<div className="h-full flex-1 relative">
				<div className="absolute top-0 left-0 md:pt-3 p-2 md:px-3 z-100 bottom-0">
					<Navigation />
				</div>

				<div className="absolute top-0 right-0 md:pt-3 p-2 md:px-3 z-100 flex justify-end">
					<Navbar />
				</div>

				<GeospyMap initialLatLng={{ lat: 5.614818, lng: -0.205874 }} />
			</div>
		</div>
	);
}
