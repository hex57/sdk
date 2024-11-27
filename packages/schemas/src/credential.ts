import { InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";

export const Credential = object({
	...BaseObject.entries,
	...object({
		userId: string(),
	}).entries,
});

export type Credential = InferOutput<typeof Credential>;
