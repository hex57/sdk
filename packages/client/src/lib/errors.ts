export async function getErrors(response: Response) {
	const errors = (await response.json()) as unknown;

	let errorText = "";

	if (typeof errors === "object" && errors != null && "error" in errors) {
		if (typeof errors.error === "string") {
			errorText = errors.error;
		} else if (Array.isArray(errors.error)) {
			errorText = errors.error.join(", ");
		}
	} else if (typeof errors === "string") {
		errorText = errors;
	} else {
		errorText = `Unknown ${response.status} error encountered`;
	}

	switch (response.status) {
		case 400:
			throw new BadRequest(errorText);
		case 401:
			throw new Unauthorized(errorText);
		case 404:
			throw new NotFound(errorText);
		case 402:
			throw new PaymentRequired(errorText);
		case 500:
			throw new ServerError(errorText);
		default:
			throw new Error(errorText);
	}
}

export class Base0x57Error extends Error {}
export class BadRequest extends Base0x57Error {}
export class NotFound extends Base0x57Error {}
export class Unauthorized extends Base0x57Error {}
export class UsageError extends Base0x57Error {}
export class ServerError extends Base0x57Error {}
export class PaymentRequired extends Base0x57Error {}
