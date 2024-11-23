import { array, InferOutput, object, record, string } from "valibot";
import { PartialAccountSchema } from "./accounts.js";
import { coercedBitfield } from "./coerce/bitfield.js";
import { coercedDate } from "./coerce/date.js";
import { BaseOrganizationSchema } from "./organization.js";
import { BaseRoleSchema } from "./roles.js";

export const BaseMemberSchema = object({
	id: string(),
	flags: coercedBitfield,
	createdAt: coercedDate,
	updatedAt: coercedDate,
});

export const PartialMemberSchema = object({
	...BaseMemberSchema.entries,
	...object({
		organizationId: string(),
		accountId: string(),
	}).entries,
});

export const MemberSchema = object({
	...BaseMemberSchema.entries,
	...object({
		organization: BaseOrganizationSchema,
		account: PartialAccountSchema,
		roles: array(BaseRoleSchema),
	}).entries,
});

export type PartialMember = InferOutput<typeof PartialMemberSchema>;
export type Member = InferOutput<typeof MemberSchema>;

export const PartialMemberResponse = object({
	member: PartialMemberSchema,
});
export const MemberResponse = object({
	member: MemberSchema,
});

export const MemberListResponse = object({
	members: record(string(), PartialMemberSchema),
});
