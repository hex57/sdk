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

export const CredentialSchema = object({
	id: string(),
	accountId: string(),
	name: nullable(string()),
	externalId: string(),
	publicKey: string(),
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

export type Credential = Output<typeof CredentialSchema>;

// Option A:
export const AccountCredentialResponseSchema = object({
	credential: CredentialSchema,
});
export type AccountCredentialResponse = Output<
	typeof AccountCredentialResponseSchema
>;

export const AccountCredentialListResponseSchema = object({
	credentials: array(CredentialSchema),
});
export type AccountCredentialListResponse = Output<
	typeof AccountCredentialListResponseSchema
>;
