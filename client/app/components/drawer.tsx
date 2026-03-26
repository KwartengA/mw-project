import React from "react";
import { Drawer } from "vaul";

const snapPoints = ["148px", "355px", 1];

export default function VaulDrawer() {
	const [snap, setSnap] = React.useState<number | string | null>(snapPoints[2]);

	return (
		<Drawer.Root
			snapPoints={snapPoints}
			activeSnapPoint={snap}
			setActiveSnapPoint={setSnap}
		>
			<Drawer.Trigger>Open Drawer</Drawer.Trigger>
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 bg-black/40" />
				<Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none flex flex-col bg-white rounded-t-2xl h-full max-h-screen">
					<div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-zinc-300 shrink-0" />
					<div
						className="flex-1 p-4"
						style={{ overflowY: snap === 1 ? "auto" : "hidden" }}
					>
						{/* content */}
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
