import {
	coerce,
	date,
	merge,
	nullable,
	number,
	object,
	record,
	string,
	type Output,
} from "valibot";
import { BaseAccountSchema } from "./accounts.js";

export const BaseCredentialSchema = object({
	id: string(),
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

export const PartialCredentialSchema = merge([
	BaseCredentialSchema,
	object({
		accountId: string(),
	}),
]);

export const CredentialSchema = merge([
	BaseCredentialSchema,
	object({
		account: BaseAccountSchema,
	}),
]);

export type PartialCredential = Output<typeof PartialCredentialSchema>;
export type Credential = Output<typeof CredentialSchema>;

export const PartialCredentialResponse = object({
	credential: PartialCredentialSchema,
});
export const CredentialResponse = object({
	credential: CredentialSchema,
});

export const CredentialListResponse = object({
	credentials: record(string(), PartialCredentialSchema),
});
