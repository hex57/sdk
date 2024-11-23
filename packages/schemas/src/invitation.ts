import { InferOutput, object, picklist, record, string } from "valibot";
import { BaseAccountSchema } from "./accounts.js";
import { coercedBitfield } from "./coerce/bitfield.js";
import { coercedDate } from "./coerce/date.js";
import { BaseOrganizationSchema } from "./organization.js";

export const BaseInvitationSchema = object({
	status: picklist(["pending", "accepted", "declined", "blocked"]),
	flags: coercedBitfield,
	createdAt: coercedDate,
	updatedAt: coercedDate,
});

export const PartialInvitationSchema = object({
	...BaseInvitationSchema.entries,
	...object({
		accountId: string(),
		organizationId: string(),
	}).entries,
});

export const InvitationSchema = object({
	...BaseInvitationSchema.entries,
	...object({
		account: BaseAccountSchema,
		organization: BaseOrganizationSchema,
	}).entries,
});

export type PartialInvitation = InferOutput<typeof PartialInvitationSchema>;
export type Invitation = InferOutput<typeof InvitationSchema>;

export const PartialInvitationResponse = object({
	invitation: PartialInvitationSchema,
});
export const InvitationResponse = object({
	invitation: InvitationSchema,
});

export const InvitationListResponse = object({
	invitations: record(string(), PartialInvitationSchema),
});
