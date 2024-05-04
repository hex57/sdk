import type { Account } from "@0x57/schemas";
import { BitField, type BitFlagResolvable } from "bitflag-js";
import type { Hex57 } from "../client.js";
import AccountCredentialRecord from "./AccountCredential.js";
import RoleRecord from "./Role.js";

export default class AccountRecord {
	readonly #client;
	readonly #id: string;
	#username: string | null;
	#email: string | null;
	#flags: BitField;
	#permissions: BitField;
	#computedPermissions: BitField;
	readonly #roles = new Map<string, RoleRecord>();
	readonly #credentials = new Map<string, AccountCredentialRecord>();
	#createdAt: Date;
	#updatedAt: Date;

	constructor(client: Hex57, record: Account) {
		this.#client = client;
		this.#id = record.id;
		this.#flags = new BitField(record.flags);
		this.#permissions = new BitField(record.permissions);
		this.#username = record.username;
		this.#email = record.email;
		this.#createdAt = record.createdAt;
		this.#updatedAt = record.updatedAt;

		record.roles.forEach((role) => {
			this.#roles.set(role.id, new RoleRecord(this.#client, role));
		});

		record.credentials.forEach((credential) => {
			this.#credentials.set(
				credential.id,
				new AccountCredentialRecord(this.#client, credential)
			);
		});

		this.#computedPermissions = new BitField(
			this.permissions.value,
			[...this.roles.values()].map((role) => role.permissions.value)
		);
	}

	get id() {
		return this.#id;
	}

	get flags() {
		return this.#flags;
	}

	get permissions() {
		return this.#permissions;
	}

	get username() {
		return this.#username;
	}

	get email() {
		return this.#email;
	}

	get roles(): ReadonlyMap<string, RoleRecord> {
		return this.#roles;
	}

	get credentials(): ReadonlyMap<string, AccountCredentialRecord> {
		return this.#credentials;
	}

	get createdAt() {
		return this.#createdAt;
	}

	get updatedAt() {
		return this.#updatedAt;
	}

	setUsername(username: string | null) {
		this.#username = username;
		return this;
	}

	setEmail(email: string | null) {
		this.#email = email;
		return this;
	}

	async save() {
		const record = await this.#client.rest.patchAccount(this.#id, {
			email: this.#email,
			username: this.#username,
			flags: this.#flags,
			permissions: this.#permissions,
		});

		this.#initialize(record);
	}

	async delete() {
		return this.#client.deleteAccount(this.#id);
	}

	async refresh() {
		const record = await this.#client.rest.getAccount(this.id);
		this.#initialize(record);
	}

	hasPermission(...flags: BitFlagResolvable[]) {
		this.#computedPermissions.has(...flags);
	}

	async addCredential(params: {
		challenge: string;
		credential: string;
		name?: string;
	}) {
		const result = await this.#client.createAccountCredential(this.#id, params);
		this.#credentials.set(result.id, result);
	}

	async deleteCredential(id: string) {
		const success = await this.#client.deleteAccountCredential(this.id, id);
		if (success && this.#credentials.has(id)) {
			this.#credentials.delete(id);
		}
	}

	async addRoles(...roles: Array<RoleRecord | string>) {
		const targets = roles.map((role) =>
			typeof role === "string" ? role : role.id
		);

		const record = await this.#client.rest.postAccountRoles(this.id, targets);
		this.#initialize(record);
	}

	async removeRoles(...roles: Array<RoleRecord | string>) {
		const targets = roles.map((role) =>
			typeof role === "string" ? role : role.id
		);

		const record = await this.#client.rest.deleteAccountRoles(this.id, targets);
		this.#initialize(record);
	}

	async setRoles(...roles: Array<RoleRecord | string>) {
		const targets = roles.map((role) =>
			typeof role === "string" ? role : role.id
		);

		const record = await this.#client.rest.putAccountRoles(this.id, targets);
		this.#initialize(record);
	}

	#initialize(record: Account) {
		this.#flags = new BitField(record.flags);
		this.#permissions = new BitField(record.permissions);
		this.#username = record.username;
		this.#email = record.email;
		this.#createdAt = record.createdAt;
		this.#updatedAt = record.updatedAt;

		this.#roles.clear();
		this.#credentials.clear();

		record.roles.forEach((role) => {
			this.#roles.set(role.id, new RoleRecord(this.#client, role));
		});

		record.credentials.forEach((credential) => {
			this.#credentials.set(
				credential.id,
				new AccountCredentialRecord(this.#client, credential)
			);
		});

		this.#computedPermissions = new BitField(
			this.permissions.value,
			[...this.roles.values()].map((role) => role.permissions.value)
		);
	}
}
