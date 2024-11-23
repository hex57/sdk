import { InferOutput, object, record, string } from "valibot";
import { coercedBitfield } from "./coerce/bitfield.js";
import { coercedDate } from "./coerce/date.js";
import { BaseOrganizationSchema } from "./organization.js";

export const BaseRoleSchema = object({
	id: string(),
	name: string(),
	permissions: coercedBitfield,
	createdAt: coercedDate,
	updatedAt: coercedDate,
});

export const PartialRoleSchema = object({
	...BaseRoleSchema.entries,
	...object({
		organizationId: string(),
	}).entries,
});

export const RoleSchema = object({
	...BaseRoleSchema.entries,
	...object({
		organization: BaseOrganizationSchema,
	}).entries,
});

export type PartialRole = InferOutput<typeof PartialRoleSchema>;
export type Role = InferOutput<typeof RoleSchema>;

export const PartialRoleResponse = object({
	role: PartialRoleSchema,
});
export const RoleResponse = object({
	role: RoleSchema,
});

export const RoleListResponse = object({
	roles: record(string(), PartialRoleSchema),
});
