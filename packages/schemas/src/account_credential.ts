import { InferOutput, number, object, string } from "valibot";
import { BaseObject } from "./base.js";

export const AccountCredential = object({
	...BaseObject.entries,
	...object({
		accountId: string(),
		publicKey: string(),
		signCount: number(),
	}).entries,
});

export type AccountCredential = InferOutput<typeof AccountCredential>;
