/* eslint-env node */

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
      apiBase = "https://www.0x57.com/api",
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
      method,
    };

    if (body != null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(this.url(url), options);

    if (response.status === 500) {
      throw new Error("0x57 Service returned a 500");
    }

    if (!response.ok) {
      await this.getErrors(response);
    }

    return response;
  }

  async getErrors(response: Response) {
    const errors = (await response.json()) as unknown;

    if (typeof errors === "object" && errors != null && "error" in errors) {
      if (typeof errors.error === "string") {
        throw new Error(`${response.status}: ${errors.error}`);
      }

      if (Array.isArray(errors.error)) {
        throw new Error(`${response.status}: ${errors.error.join(", ")}`);
      }
    } else if (typeof errors === "string") {
      throw new Error(`${response.status}: ${errors}`);
    } else {
      throw new Error(`Unknown ${response.status} error encountered`);
    }
  }
}
