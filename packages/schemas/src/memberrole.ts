import { InferOutput, object, string } from "valibot";
import { BaseObject } from "./base.js";

export const MemberRole = object({
	...BaseObject.entries,
	...object({
		memberId: string(),
		roleId: string(),
	}).entries,
});

export type MemberRole = InferOutput<typeof MemberRole>;
