import { array, InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";
import { coercedBitfield } from "./coerce/bitfield.js";
import { Environment } from "./environment.js";

export const ShallowWorkspace = object({
	...BaseObject.entries,
	...object({
		name: string(),
		token: string(),
		flags: coercedBitfield,
	}).entries,
});

export const Workspace = object({
	...ShallowWorkspace.entries,
	...object({
		environments: array(Environment),
	}).entries,
});

export type ShallowWorkspace = InferOutput<typeof ShallowWorkspace>;
export type Workspace = InferOutput<typeof Workspace>;
