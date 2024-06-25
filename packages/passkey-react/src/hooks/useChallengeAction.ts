import { useCallback, useEffect, useState } from "react";

export function useChallengeAction(action: () => Promise<string>) {
	const [challenge, setChallenge] = useState<string | null>(null);

	const refresh = useCallback(() => {
		const getChallenge = async () => {
			const value = await action();
			setChallenge(value);
		};

		void getChallenge();
	}, [action]);

	// TODO: There needs to be a better way of doing this. Something about
	// how next returns `action` makes it unstable. We'll want to make this
	// more robust soon
	useEffect(() => {
		refresh();
	}, []);

	return { challenge, refresh };
}
