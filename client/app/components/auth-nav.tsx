import { IncidentWidget } from "./incident-widget";
import { Profile } from "./profile";

function AuthNav() {
	return (
		<div className="flex items-center gap-2 max-md:gap-1 md:justify-between">
			<div className="flex max-md:gap-1 gap-2 items-center max-md:flex-1">
				<IncidentWidget />

				<Profile />
			</div>
		</div>
	);
}

export { AuthNav };
