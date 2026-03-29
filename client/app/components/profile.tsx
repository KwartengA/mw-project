import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import { Avatar } from "./avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ProfileMenu } from "./profile-menu";

function Profile() {
	const { user } = useRouteLoaderData<typeof rootLoader>("root") || {};

	if (!user) return null;

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger asChild>
				<div className="shrink-0 rounded-full bg-stone-100 dark:bg-neutral-800 p-0.5">
					<Avatar name={user.name} />
				</div>
			</PopoverTrigger>
			<PopoverContent className="z-100">
				<ProfileMenu />
			</PopoverContent>
		</Popover>
	);
}

export { Profile };
