import { array, InferOutput, nullable, object, record, string } from "valibot";
import { coercedBitfield } from "./coerce/bitfield.js";
import { coercedDate } from "./coerce/date.js";
import { BaseCredentialSchema } from "./credentials.js";
import { BaseEnvironmentSchema } from "./environment.js";
import { BaseInvitationSchema } from "./invitation.js";
import { BaseMemberSchema } from "./member.js";

export const BaseAccountSchema = object({
	id: string(),
	createdAt: coercedDate,
	updatedAt: coercedDate,
	email: nullable(string()),
	username: nullable(string()),
	flags: coercedBitfield,
});

export const PartialAccountSchema = object({
	...BaseAccountSchema.entries,
	...object({
		environmentId: string(),
	}).entries,
});

export const AccountSchema = object({
	...BaseAccountSchema.entries,
	...object({
		environment: BaseEnvironmentSchema,
		credentials: array(BaseCredentialSchema),
		memberships: array(BaseMemberSchema),
		invitations: array(BaseInvitationSchema),
	}).entries,
});

export type PartialAccount = InferOutput<typeof PartialAccountSchema>;
export type Account = InferOutput<typeof AccountSchema>;

export const PartialAccountResponse = object({ account: PartialAccountSchema });
export const AccountResponse = object({
	account: AccountSchema,
});

export const AccountListResponse = object({
	accounts: record(string(), PartialAccountSchema),
});
