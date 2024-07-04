import {
	array,
	bigint,
	coerce,
	date,
	nullable,
	object,
	string,
	type Output,
} from "valibot";
import { AccountCredentialSchema } from "./credentials.js";

export const AccountSchema = object({
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
	workspaceId: string(),
	environmentId: string(),
	email: nullable(string()),
	username: nullable(string()),
	flags: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
	credentials: array(AccountCredentialSchema),
});

export type Account = Output<typeof AccountSchema>;

export const AccountResponseSchema = object({
	account: AccountSchema,
});
export type AccountResponse = Output<typeof AccountResponseSchema>;

export const AccountListResponseSchema = object({
	accounts: array(AccountSchema),
});
export type AccountListResponse = Output<typeof AccountListResponseSchema>;
