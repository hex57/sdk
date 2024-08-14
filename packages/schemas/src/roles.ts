import {
	bigint,
	coerce,
	date,
	merge,
	object,
	string,
	type Output,
} from "valibot";
import { BaseOrganizationSchema } from "./organization.js";

export const BaseRoleSchema = object({
	id: string(),
	name: string(),
	permissions: coerce(bigint(), (value) => {
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

export const PartialRoleSchema = merge([
	BaseRoleSchema,
	object({
		organizationId: string(),
	}),
]);

export const RoleSchema = merge([
	BaseRoleSchema,
	object({
		organization: BaseOrganizationSchema,
	}),
]);

export type PartialRole = Output<typeof PartialRoleSchema>;
export type Role = Output<typeof RoleSchema>;

export const PartialRoleResponse = object({
	role: PartialRoleSchema,
});
export const RoleResponse = object({
	role: RoleSchema,
});
