import {
	array,
	bigint,
	coerce,
	date,
	object,
	string,
	type Output,
} from "valibot";

export const RoleSchema = object({
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
	permissions: coerce(bigint(), (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return BigInt(value);
		}

		return value;
	}),
});

export type Role = Output<typeof RoleSchema>;

export const RoleResponseSchema = object({
	role: RoleSchema,
});
export type RoleResponse = Output<typeof RoleResponseSchema>;

export const RoleListResponseSchema = object({
	roles: array(RoleSchema),
});
export type RoleListResponse = Output<typeof RoleListResponseSchema>;
