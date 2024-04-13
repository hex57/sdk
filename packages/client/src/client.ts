/* eslint-env node */
import {
  BadRequest,
  Base0x57Error,
  NotFound,
  PaymentRequired,
  ServerError,
  Unauthorized,
} from "./errors.js";

export * from "./errors.js";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
}

export enum APIVersion {
  ALPHA = "alpha",
}

export interface Hex57Options {
  apiVersion?: APIVersion;
  apiBase?: string;
}

export class Hex57 {
  readonly #apiUrl: string;
  #key: string;

  constructor(
    key: string,
    {
      apiVersion = APIVersion.ALPHA,
      apiBase = "https://www.0x57.dev/api",
    }: Hex57Options = {}
  ) {
    this.#key = key;
    this.#apiUrl = `${apiBase}/${apiVersion}`;
  }

  set key(key: string) {
    this.#key = key;
  }

  url(path: string) {
    // im not stoked on this since there are ways to break this. for example if you pass alpha/ as the version
    // but it feels unnecessary to pull in an entire library for safe url joining
    // especially since this is mostly a debug feature
    if (!path.startsWith("/")) {
      return `${this.#apiUrl}/${path}`;
    }

    return `${this.#apiUrl}${path}`;
  }

  async request<T>(
    method: RequestMethod,
    url: string,
    body?: Record<string, unknown>
  ) {
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: this.#key,
      },
      credentials: "include",
      method,
    };

    if (body != null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(this.url(url), options);
    if (!response.ok) {
      await this.getErrors(response);
    }

    return response;
  }

  async accepting<T>(promise: Promise<T>): Promise<T | undefined> {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof Base0x57Error) return undefined;
      throw error;
    }
  }

  async getErrors(response: Response) {
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
}
