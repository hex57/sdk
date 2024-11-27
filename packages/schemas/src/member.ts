import { InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";
import { coercedBitfield } from "./coerce/bitfield.js";

export const Member = object({
	...BaseObject.entries,
	...object({
		organizationId: string(),
		accountId: string(),
		flags: coercedBitfield,
	}).entries,
});

export type Member = InferOutput<typeof Member>;
