import {
	array,
	bigint,
	coerce,
	date,
	object,
	string,
	type Output,
} from "valibot";

export const OrganizationSchema = object({
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

	environmentId: string(),
	name: string(),
	flags: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
});

export type Organization = Output<typeof OrganizationSchema>;

export const OrganizationResponseSchema = object({
	organization: OrganizationSchema,
});
export type OrganizationResponse = Output<typeof OrganizationResponseSchema>;

export const OrganizationListResponseSchema = object({
	organizations: array(OrganizationSchema),
});
export type OrganizationListResponse = Output<
	typeof OrganizationListResponseSchema
>;
