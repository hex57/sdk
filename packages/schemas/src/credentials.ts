import { InferOutput, nullable, number, object, record, string } from "valibot";
import { BaseAccountSchema } from "./accounts.js";
import { coercedDate } from "./coerce/date.js";

export const BaseCredentialSchema = object({
	id: string(),
	name: nullable(string()),
	signCount: number(),

	createdAt: coercedDate,
	updatedAt: coercedDate,
});

export const PartialCredentialSchema = object({
	...BaseCredentialSchema.entries,
	...object({
		accountId: string(),
	}).entries,
});

export const CredentialSchema = object({
	...BaseCredentialSchema.entries,
	...object({
		account: BaseAccountSchema,
	}).entries,
});

export type PartialCredential = InferOutput<typeof PartialCredentialSchema>;
export type Credential = InferOutput<typeof CredentialSchema>;

export const PartialCredentialResponse = object({
	credential: PartialCredentialSchema,
});
export const CredentialResponse = object({
	credential: CredentialSchema,
});

export const CredentialListResponse = object({
	credentials: record(string(), PartialCredentialSchema),
});
