import type { Prettify } from "@0x57/interfaces";
import { getCredential } from "@0x57/passkey";
import {useCallback, type FormEvent, useState} from "react";

interface LoginProps<ActionResult> {
	challenge: string;
	relyingPartyId: string;
	options?: {
		timeout?: number;
	};
	action: (data: FormData) => Promise<ActionResult>;
	onSuccess: (result: ActionResult) => void;
	onError: (error: unknown) => void;
}

export function useLogin<ActionResult>({
	challenge,
	relyingPartyId,
	options,
	action,
	onSuccess,
	onError,
}: Prettify<LoginProps<ActionResult>>) {
	const [isPending, setIsPending] = useState(false);
	const login = useCallback(
		async (event: FormEvent) => {
			let result: ActionResult | undefined;
			setIsPending(true);
			try {
				event.preventDefault();

				const credential = await getCredential(challenge, relyingPartyId, {
					timeout: options?.timeout,
				});

				const data = new FormData();
				data.set("credential", JSON.stringify(credential));

				result = await action(data);
			} catch (error) {
				onError(error);
				setIsPending(false);
				return
			}

			onSuccess(result);

			setIsPending(false);
		},
		[action, challenge, onError, onSuccess, options?.timeout, relyingPartyId]
	);

	return { isPending, login };
}
