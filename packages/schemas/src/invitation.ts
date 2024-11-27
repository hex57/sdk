import { enum_, InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";

export enum InvitationStatus {
	PENDING = "pending",
	ACCEPTED = "accepted",
	DECLINED = "declined",
	BLOCKED = "blocked",
}

export const Invitation = object({
	...BaseObject.entries,
	...object({
		organizationId: string(),
		accountId: string(),
		createdBy: string(),
		status: enum_(InvitationStatus),
	}).entries,
});

export type Invitation = InferOutput<typeof Invitation>;
