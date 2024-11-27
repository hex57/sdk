import { InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";
import { coercedBitfield } from "./coerce/bitfield.js";

export const Role = object({
	...BaseObject.entries,
	...object({
		organizationId: string(),
		permissions: coercedBitfield,
	}).entries,
});

export type Role = InferOutput<typeof Role>;
