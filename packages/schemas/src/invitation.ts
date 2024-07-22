import {
	array,
	bigint,
	coerce,
	date,
	object,
	picklist,
	string,
	type Output,
} from "valibot";

export const InvitationSchema = object({
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
	status: picklist(["pending", "accepted", "declined", "blocked"]),
	flags: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
});

export type Invitation = Output<typeof InvitationSchema>;

export const InvitationResponseSchema = object({
	invitation: InvitationSchema,
});
export type InvitationResponse = Output<typeof InvitationResponseSchema>;

export const InvitationListResponseSchema = object({
	invitations: array(InvitationSchema),
});
export type InvitationListResponse = Output<
	typeof InvitationListResponseSchema
>;
