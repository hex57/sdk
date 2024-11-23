import { InferOutput, object, record, string } from "valibot";
import { coercedBitfield } from "./coerce/bitfield.js";
import { coercedDate } from "./coerce/date.js";
import { BaseEnvironmentSchema } from "./environment.js";

export const BaseOrganizationSchema = object({
	id: string(),
	name: string(),
	flags: coercedBitfield,
	createdAt: coercedDate,
	updatedAt: coercedDate,
});

export const PartialOrganizationSchema = object({
	...BaseOrganizationSchema.entries,
	...object({
		environmentId: string(),
	}).entries,
});

export const OrganizationSchema = object({
	...BaseOrganizationSchema.entries,
	...object({ environment: BaseEnvironmentSchema }).entries,
});

export type PartialOrganization = InferOutput<typeof PartialOrganizationSchema>;
export type Organization = InferOutput<typeof OrganizationSchema>;

export const PartialOrganizationResponse = object({
	organization: PartialOrganizationSchema,
});
export const OrganizationResponse = object({
	organization: OrganizationSchema,
});

export const OrganizationListResponse = object({
	organizations: record(string(), PartialOrganizationSchema),
});
