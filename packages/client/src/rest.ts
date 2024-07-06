/* eslint-env node */

import {
  AccountCredentialResponseSchema,
  AccountResponseSchema,
  RoleResponseSchema,
  type Account,
  type AccountCredential,
  type Role,
} from "@0x57/schemas";
import type { BitField } from "bitflag-js";
import { parse } from "valibot";
import * as Hex57Errors from "./errors.js";

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

export interface RestClientOptions {
  apiVersion?: APIVersion;
  apiBase?: string;
  fetch?: (url: string, options: ResponseInit) => Promise<Response>;
}

export class RestClient {
  readonly #apiUrl: string;
  #key: string;
  #fetch: (url: string, options: ResponseInit) => Promise<Response>;

  constructor(
    key: string,
    {
      apiVersion = APIVersion.ALPHA,
      apiBase = "https://www.0x57.dev/api",
      fetch = globalThis.fetch,
    }: RestClientOptions
  ) {
    this.#key = key;
    this.#apiUrl = `${apiBase}/${apiVersion}`;
    this.#fetch = fetch;
  }

  set key(key: string) {
    this.#key = key;
  }

  set fetch(fetch: (url: string, options: ResponseInit) => Promise<Response>) {
    this.#fetch = fetch;
  }

  url(path: string) {
    return `${this.#apiUrl}${path}`;
  }

  async request<T>(
    method: RequestMethod,
    url: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ) {
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: this.#key,
        ...headers,
      },
      method,
    };

    if (body != null) {
      options.body = JSON.stringify(body);
    }

    const response = await this.#fetch(this.url(url), options);

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
        throw new Hex57Errors.BadRequest(errorText);
      case 401:
        throw new Hex57Errors.Unauthorized(errorText);
      case 404:
        throw new Hex57Errors.NotFound(errorText);
      case 402:
        throw new Hex57Errors.PaymentRequired(errorText);
      case 500:
        throw new Hex57Errors.ServerError(errorText);
      default:
        throw new Error(errorText);
    }
  }

  async postAccounts(parameters: {
    challenge: string;
    credential: string;
    username?: string;
    email?: string;
  }) {
    const response = await this.request(RequestMethod.POST, "/accounts", {
      challenge: parameters.challenge,
      credential: parameters.credential,
      username: parameters.username,
      email: parameters.email,
    });

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);
    return data.account;
  }

  async postSessions(parameters: {
    challenge: string;
    credential: string;
  }): Promise<Account> {
    const response = await this.request(RequestMethod.POST, "/sessions", {
      challenge: parameters.challenge,
      credential: parameters.credential,
    });

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);

    return data.account;
  }

  async getAccount(id: string): Promise<Account> {
    const response = await this.request(RequestMethod.GET, `/accounts/${id}`);

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);

    return data.account;
  }

  async patchAccount(
    id: string,
    {
      email,
      username,
      permissions,
      flags,
    }: {
      email?: string | null;
      username?: string | null;
      flags?: BitField | bigint;
      permissions?: BitField | bigint;
    }
  ): Promise<Account> {
    const response = await this.request(
      RequestMethod.PATCH,
      `/accounts/${id}`,
      {
        ...(email !== undefined ? { email } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(permissions !== undefined
          ? { permissions: permissions.toString() }
          : {}),
        ...(flags !== undefined ? { flags: flags.toString() } : {}),
      }
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);

    return data.account;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const response = await this.request(
      RequestMethod.DELETE,
      `/accounts/${id}`
    );
    return response.ok;
  }

  async postAccountCredential(
    id: string,
    {
      challenge,
      credential,
      name,
    }: { challenge: string; credential: string; name?: string }
  ): Promise<AccountCredential> {
    const response = await this.request(
      RequestMethod.POST,
      `/accounts/${id}/credentials`,
      {
        challenge,
        credential,
        name,
      }
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountCredentialResponseSchema, json);

    return data.credential;
  }

  async getAccountCredential(
    accountId: string,
    id: string
  ): Promise<AccountCredential> {
    const response = await this.request(
      RequestMethod.GET,
      `/accounts/${accountId}/credentials/${id}`
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountCredentialResponseSchema, json);

    return data.credential;
  }

  async patchAccountCredential(
    accountId: string,
    id: string,
    { name }: { name?: string | null }
  ): Promise<AccountCredential> {
    const response = await this.request(
      RequestMethod.PATCH,
      `/accounts/${accountId}/credentials/${id}`,
      {
        ...(name !== undefined ? { name } : {}),
      }
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountCredentialResponseSchema, json);

    return data.credential;
  }

  async deleteAccountCredential(
    accountId: string,
    credentialId: string
  ): Promise<boolean> {
    const response = await this.request(
      RequestMethod.DELETE,
      `/accounts/${accountId}/credentials/${credentialId}`
    );
    return response.ok;
  }

  async postRole(parameters: {
    name: string;
    permissions: BitField | bigint;
  }): Promise<Role> {
    const response = await this.request(RequestMethod.POST, `/roles`, {
      name: parameters.name,
      permissions: parameters.permissions.toString(),
    });

    const json = (await response.json()) as unknown;
    const data = parse(RoleResponseSchema, json);

    return data.role;
  }

  async getRole(id: string): Promise<Role> {
    const response = await this.request(RequestMethod.GET, `/roles/${id}`);

    const json = (await response.json()) as unknown;
    const data = parse(RoleResponseSchema, json);

    return data.role;
  }

  async patchRole(
    id: string,
    { name, permissions }: { name?: string; permissions?: BitField | bigint }
  ): Promise<Role> {
    const response = await this.request(RequestMethod.PATCH, `/roles/${id}`, {
      ...(name != null ? { name } : {}),
      ...(permissions != null ? { permissions: permissions.toString() } : {}),
    });

    const json = (await response.json()) as unknown;
    const data = parse(RoleResponseSchema, json);

    return data.role;
  }

  async deleteRole(id: string): Promise<boolean> {
    const response = await this.request(RequestMethod.DELETE, `/roles/${id}`);
    return response.ok;
  }

  async postAccountRoles(id: string, roleIds: string[]): Promise<Account> {
    const response = await this.request(
      RequestMethod.POST,
      `/accounts/${id}/roles`,
      {
        roleIds,
      }
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);

    return data.account;
  }

  async deleteAccountRoles(id: string, roleIds: string[]): Promise<Account> {
    const response = await this.request(
      RequestMethod.DELETE,
      `/accounts/${id}/roles`,
      {
        roleIds,
      }
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);

    return data.account;
  }

  async putAccountRoles(id: string, roleIds: string[]): Promise<Account> {
    const response = await this.request(
      RequestMethod.PUT,
      `/accounts/${id}/roles`,
      {
        roleIds,
      }
    );

    const json = (await response.json()) as unknown;
    const data = parse(AccountResponseSchema, json);

    return data.account;
  }
}
