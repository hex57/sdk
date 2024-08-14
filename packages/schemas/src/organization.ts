import {
	bigint,
	coerce,
	date,
	merge,
	object,
	string,
	type Output,
} from "valibot";
import { BaseEnvironmentSchema } from "./environment.js";

export const BaseOrganizationSchema = object({
	id: string(),
	name: string(),
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

export const PartialOrganizationSchema = merge([
	BaseOrganizationSchema,
	object({
		environmentId: string(),
	}),
]);

export const OrganizationSchema = merge([
	BaseOrganizationSchema,
	object({ environment: BaseEnvironmentSchema }),
]);

export type PartialOrganization = Output<typeof PartialOrganizationSchema>;
export type Organization = Output<typeof OrganizationSchema>;

export const PartialOrganizationResponse = object({
	organization: PartialOrganizationSchema,
});
export const OrganizationResponse = object({
	organization: OrganizationSchema,
});
