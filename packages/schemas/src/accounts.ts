import {
	array,
	bigint,
	coerce,
	date,
	merge,
	nullable,
	object,
	record,
	string,
	type Output,
} from "valibot";
import { BaseCredentialSchema } from "./credentials.js";
import { BaseEnvironmentSchema } from "./environment.js";
import { BaseInvitationSchema } from "./invitation.js";
import { BaseMemberSchema } from "./member.js";

export const BaseAccountSchema = object({
	id: string(),
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
	email: nullable(string()),
	username: nullable(string()),
	flags: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
});

export const PartialAccountSchema = merge([
	BaseAccountSchema,
	object({
		environmentId: string(),
	}),
]);

export const AccountSchema = merge([
	BaseAccountSchema,
	object({
		environment: BaseEnvironmentSchema,
		credentials: array(BaseCredentialSchema),
		memberships: array(BaseMemberSchema),
		invitations: array(BaseInvitationSchema),
	}),
]);

export type PartialAccount = Output<typeof PartialAccountSchema>;
export type Account = Output<typeof AccountSchema>;

export const PartialAccountResponse = object({ account: PartialAccountSchema });
export const AccountResponse = object({
	account: AccountSchema,
});

export const AccountListResponse = object({
	accounts: record(string(), PartialAccountSchema),
});
