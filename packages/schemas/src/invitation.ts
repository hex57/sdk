import {
	bigint,
	coerce,
	date,
	merge,
	object,
	picklist,
	record,
	string,
	type Output,
} from "valibot";
import { BaseAccountSchema } from "./accounts.js";
import { BaseOrganizationSchema } from "./organization.js";

export const BaseInvitationSchema = object({
	status: picklist(["pending", "accepted", "declined", "blocked"]),
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

export const PartialInvitationSchema = merge([
	BaseInvitationSchema,
	object({
		accountId: string(),
		organizationId: string(),
	}),
]);

export const InvitationSchema = merge([
	BaseInvitationSchema,
	object({
		account: BaseAccountSchema,
		organization: BaseOrganizationSchema,
	}),
]);

export type PartialInvitation = Output<typeof PartialInvitationSchema>;
export type Invitation = Output<typeof InvitationSchema>;

export const PartialInvitationResponse = object({
	invitation: PartialInvitationSchema,
});
export const InvitationResponse = object({
	invitation: InvitationSchema,
});

export const InvitationListResponse = object({
	invitations: record(string(), PartialInvitationSchema),
});
