import type { Prettify } from "@0x57/interfaces";
import { createCredential } from "@0x57/passkey";
import { useCallback } from "react";

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

export function useRegister<ActionResult>({
	challenge,
	relyingParty,
	options,
	action,
	onSuccess,
	onError,
}: Prettify<RegisterProps<ActionResult>>) {
	const register = useCallback(
		async (user: { username: string; email: string }) => {
			let result: ActionResult | undefined;
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
			}

			if (result) {
				onSuccess(result);
			} else {
				onError(new Error("Unknown Error"));
			}
		},
		[action, challenge, onError, onSuccess, options?.timeout, relyingParty]
	);

	return register;
}
