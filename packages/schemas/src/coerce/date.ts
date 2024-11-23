import { number, pipe, string, transform, union } from "valibot";

export const coercedDate = pipe(
	union([string(), number()]),
	transform((input) => new Date(input)),
);
