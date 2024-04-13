import {
  coerce,
  date,
  enum_,
  maxLength,
  number,
  object,
  regex,
  string,
  type Output,
} from "valibot";

export enum HandleVerificationState {
  VERIFYING = "verifying",
  REJECTED = "rejected",
  ACTIVE = "active",
  EXPIRED = "expired",
}

export const HandleStringSchema = string([
  regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
    "Handle must be a valid domain name"
  ),
  maxLength(
    253,
    "Handle must be at most 253 characters long to comply with DNS standards"
  ),
]);

export const HandleSchema = object({
  id: string(),
  createdAt: coerce(date(), (value) => {
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value);
    }

    return value;
  }),
  updatedAt: coerce(date(), (value) => {
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value);
    }

    return value;
  }),
  checkedAt: coerce(date(), (value) => {
    if (typeof value === "string" || typeof value === "number") {
      return new Date(value);
    }

    return value;
  }),
  workspaceId: string(),
  environmentId: string(),
  accountId: string(),
  handle: HandleStringSchema,
  state: enum_(HandleVerificationState),
  verificationAttempts: number(),
});

export type Handle = Output<typeof HandleSchema>;
