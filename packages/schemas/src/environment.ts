import { coerce, date, merge, object, string, type Output } from "valibot";

export const BaseEnvironmentSchema = object({
	id: string(),
	name: string(),
	origin: string(),
	rpid: string(),
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

export const PartialEnvironmentSchema = merge([
	BaseEnvironmentSchema,
	object({
		workspaceId: string(),
	}),
]);

export const EnvironmentSchema = merge([
	BaseEnvironmentSchema,
	object({
		// workspace: BaseWorkspaceSchema,
	}),
]);

export type PartalEnvironment = Output<typeof PartialEnvironmentSchema>;
export type Environment = Output<typeof EnvironmentSchema>;

export const PartialEnvironmentResponse = object({
	environment: PartialEnvironmentSchema,
});
export const EnvironmentResponse = object({
	environment: EnvironmentSchema,
});
