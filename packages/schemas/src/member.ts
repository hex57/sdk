import {
	array,
	bigint,
	coerce,
	date,
	merge,
	object,
	record,
	string,
	type Output,
} from "valibot";
import { PartialAccountSchema } from "./accounts.js";
import { BaseOrganizationSchema } from "./organization.js";
import { BaseRoleSchema } from "./roles.js";

export const BaseMemberSchema = object({
	id: string(),
	flags: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
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

export const PartialMemberSchema = merge([
	BaseMemberSchema,
	object({
		organizationId: string(),
		accountId: string(),
	}),
]);

export const MemberSchema = merge([
	BaseMemberSchema,
	object({
		organization: BaseOrganizationSchema,
		account: PartialAccountSchema,
		roles: array(BaseRoleSchema),
	}),
]);

export type PartialMember = Output<typeof PartialMemberSchema>;
export type Member = Output<typeof MemberSchema>;

export const PartialMemberResponse = object({
	member: PartialMemberSchema,
});
export const MemberResponse = object({
	member: MemberSchema,
});

export const MemberListResponse = object({
	members: record(string(), PartialMemberSchema),
});
