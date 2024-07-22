import {
	array,
	bigint,
	coerce,
	date,
	object,
	string,
	type Output,
} from "valibot";

export const MemberSchema = object({
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

	organizationId: string(),
	accountId: string(),
	flags: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
});

export type Member = Output<typeof MemberSchema>;

export const MemberResponseSchema = object({
	member: MemberSchema,
});
export type MemberResponse = Output<typeof MemberResponseSchema>;

export const MemberListResponseSchema = object({
	members: array(MemberSchema),
});
export type MemberListResponse = Output<typeof MemberListResponseSchema>;
