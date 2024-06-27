import type { Prettify } from "@0x57/interfaces";
import { createCredential } from "@0x57/passkey";
import {useCallback, useState} from "react";

interface RegisterProps<ActionResult> {
	challenge: string;
	relyingParty: {
		id: string;
		name: string;
	};
	options?: {
		timeout?: number;
	};
	action: (data: FormData) => Promise<ActionResult>;
	onSuccess: (result: ActionResult) => void;
	onError: (error: unknown) => void;
}

export function useRegister<ActionResult extends { error?: string }>({
	challenge,
	relyingParty,
	options,
	action,
	onSuccess,
	onError,
}: Prettify<RegisterProps<ActionResult>>) {
	const [isPending, setIsPending] = useState(false);

	const register = useCallback(
		async (user: { username: string; email: string }) => {
			let result: ActionResult;
			setIsPending(true);
			try {
				const credential = await createCredential(
					{
						name: user.email,
						displayName: user.username,
					},
					relyingParty,
					challenge,
					{
						timeout: options?.timeout,
					}
				);

				const data = new FormData();
				data.set("credential", JSON.stringify(credential));
				data.set("email", user.email);
				data.set("username", user.username);

				result = await action(data);
			} catch (error) {
				onError(error);
				setIsPending(false);
				return;
			}

			onSuccess(result);
			setIsPending(false);
		},
		[action, challenge, onError, onSuccess, options?.timeout, relyingParty]
	);

	return { isPending, register };
}
