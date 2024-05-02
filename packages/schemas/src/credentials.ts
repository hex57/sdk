import {
	array,
	coerce,
	date,
	nullable,
	number,
	object,
	string,
	type Output,
} from "valibot";

export const AccountCredentialSchema = object({
	id: string(),
	accountId: string(),
	name: nullable(string()),
	signCount: number(),

	createdAt: coerce(date(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return new Date(value);
		}

		return value;
	}),
	updatedAt: coerce(date(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return new Date(value);
		}

		return value;
	}),
});

export type AccountCredential = Output<typeof AccountCredentialSchema>;

export const AccountCredentialResponseSchema = object({
	credential: AccountCredentialSchema,
});
export type AccountCredentialResponse = Output<
	typeof AccountCredentialResponseSchema
>;

export const AccountCredentialListResponseSchema = object({
	credentials: array(AccountCredentialSchema),
});
export type AccountCredentialListResponse = Output<
	typeof AccountCredentialListResponseSchema
>;
