import * as v from "valibot";

export const AuthenticationResponse = v.object({
	user: v.object({
		id: v.string(),
		token: v.string(),
	}),
});
