import { object, string } from "valibot";
import { coercedDate } from "./coerce/date.js";

export const BaseObject = object({
	id: string(),
	createdAt: coercedDate,
	updatedAt: coercedDate,
});
