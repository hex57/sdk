import { InferOutput, number, object, string } from "valibot";
import { BaseObject } from "./base.js";

export const Environment = object({
	...BaseObject.entries,
	...object({
		workspaceId: string(),
		name: string(),
		origin: string(),
		rpid: string(),
		accountsCount: number(),
	}).entries,
});

export type Environment = InferOutput<typeof Environment>;
