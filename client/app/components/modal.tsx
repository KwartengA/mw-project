import { useMounted } from "@mw/common";
import clsx from "clsx";
import React from "react";
import ReactDOM from "react-dom";

interface Props extends React.PropsWithChildren {
	className?: string;
	open?: boolean;
	onClose?: VoidFunction;
}

function Modal({ children, className, onClose, open }: Props) {
	const ref = React.useRef<HTMLDialogElement>(null);
	const mounted = useMounted();

	function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
		if (event.target === ref.current) {
			onClose?.();
		}
	}

	React.useEffect(() => {
		if (open) {
			if (!ref.current?.open) ref.current?.showModal();
		} else {
			ref.current?.close();
		}

		const listener = () => {
			onClose?.();
		};

		ref.current?.addEventListener("close", listener);

		return () => ref.current?.removeEventListener("close", listener);
	}, [open, onClose, mounted]);

	if (!mounted) {
		return null;
	}

	return ReactDOM.createPortal(
		<dialog
			className={clsx(
				"rounded-xl border border-zinc-300 dark:border-neutral-700 shadow dark:bg-neutral-900",
				className,
			)}
			ref={ref}
			onClick={handleBackdropClick}
			onKeyDown={(event) => {
				if (event.key === "Escape") onClose?.();
			}}
		>
			{children}
		</dialog>,
		document.body,
	);
}

export { Modal };
