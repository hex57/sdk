import { InferOutput, object, string } from "valibot";
import { coercedDate } from "./coerce/date.js";

export const BaseEnvironmentSchema = object({
	id: string(),
	name: string(),
	origin: string(),
	rpid: string(),
	createdAt: coercedDate,
	updatedAt: coercedDate,
});

export const PartialEnvironmentSchema = object({
	...BaseEnvironmentSchema.entries,
	...object({
		workspaceId: string(),
	}).entries,
});

export const EnvironmentSchema = object({
	...BaseEnvironmentSchema.entries,
	...object({
		// workspace: BaseWorkspaceSchema,
	}).entries,
});

export type PartalEnvironment = InferOutput<typeof PartialEnvironmentSchema>;
export type Environment = InferOutput<typeof EnvironmentSchema>;

export const PartialEnvironmentResponse = object({
	environment: PartialEnvironmentSchema,
});
export const EnvironmentResponse = object({
	environment: EnvironmentSchema,
});
