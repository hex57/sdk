import { BitField } from "bitflag-js";
import { bigint, pipe, string, transform, union } from "valibot";

export const coercedBitfield = pipe(
	union([string(), bigint()]),
	transform(
		(input) => new BitField(typeof input === "bigint" ? input : BigInt(input)),
	),
);
