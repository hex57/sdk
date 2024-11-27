import { InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";
import { coercedBitfield } from "./coerce/bitfield.js";

export const Account = object({
	...BaseObject.entries,
	...object({
		environmentId: string(),
		email: string(),
		username: string(),
		flags: coercedBitfield,
	}).entries,
});

export type Account = InferOutput<typeof Account>;
