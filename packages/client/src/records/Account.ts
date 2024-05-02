import type { Account } from "@0x57/schemas";
import { BitField, type BitFlagResolvable } from "bitflag-js";
import type { Hex57 } from "../client.js";
import AccountCredentialRecord from "./AccountCredential.js";
import PersistentBitField from "./PersistedBitField.js";
import RoleRecord from "./Role.js";

export default class AccountRecord {
	readonly id: string;

	username: string | null;
	email: string | null;
	flags: PersistentBitField;
	permissions: PersistentBitField;
	computedPermissions: BitField;
	roles = new Map<string, RoleRecord>();
	credentials = new Map<string, AccountCredentialRecord>();
	createdAt: Date;
	updatedAt: Date;

	readonly #client;

	constructor(client: Hex57, record: Account) {
		this.#client = client;
		this.id = record.id;
		this.flags = new PersistentBitField(this.#saveFlags, record.flags);
		this.permissions = new PersistentBitField(
			this.#savePermissions,
			record.permissions
		);
		this.username = record.username;
		this.email = record.email;
		this.createdAt = record.createdAt;
		this.updatedAt = record.updatedAt;

		record.roles.forEach((role) => {
			this.roles.set(role.id, new RoleRecord(this.#client, role));
		});

		record.credentials.forEach((credential) => {
			this.credentials.set(
				credential.id,
				new AccountCredentialRecord(this.#client, credential)
			);
		});

		this.computedPermissions = new BitField(
			this.permissions.value,
			[...this.roles.values()].map((role) => role.permissions.value)
		);
	}

	async update(params: {
		email?: string;
		username?: string;
		flags?: PersistentBitField | BitField | bigint;
		permissions?: PersistentBitField | BitField | bigint;
	}) {
		const record = await this.#client.updateAccount(this.id, params);
		this.#initialize(record);
	}

	async delete() {
		return this.#client.deleteAccount(this.id);
	}

	hasPermission(...flags: BitFlagResolvable[]) {
		this.computedPermissions.has(...flags);
	}

	async addCredential(params: {
		challenge: string;
		credential: string;
		name?: string;
	}) {
		const result = await this.#client.createAccountCredential(this.id, params);

		this.credentials.set(
			result.id,
			new AccountCredentialRecord(this.#client, result)
		);

		return result;
	}

	async deleteCredential(id: string) {
		const success = await this.#client.deleteAccountCredential(this.id, id);
		if (success && this.credentials.has(id)) {
			this.credentials.delete(id);
		}

		return success;
	}

	async addRoles(...roles: Array<RoleRecord | string>) {
		const targets = roles.map((role) =>
			typeof role === "string" ? role : role.id
		);

		const record = await this.#client.addAccountRoles(this.id, ...targets);
		this.#initialize(record);
	}

	async removeRoles(...roles: Array<RoleRecord | string>) {
		const targets = roles.map((role) =>
			typeof role === "string" ? role : role.id
		);

		const record = await this.#client.removeAccountRoles(this.id, ...targets);
		this.#initialize(record);
	}

	async refresh() {
		const record = await this.#client.getAccount(this.id);
		this.#initialize(record);
	}

	async #saveFlags() {
		return this.update({ flags: this.flags });
	}

	async #savePermissions() {
		return this.update({ permissions: this.permissions });
	}

	#initialize(record: Account) {
		this.flags = new PersistentBitField(this.#saveFlags, record.flags);
		this.permissions = new PersistentBitField(
			this.#savePermissions,
			record.permissions
		);
		this.username = record.username;
		this.email = record.email;
		this.createdAt = record.createdAt;
		this.updatedAt = record.updatedAt;

		record.roles.forEach((role) => {
			this.roles.set(role.id, new RoleRecord(this.#client, role));
		});

		record.credentials.forEach((credential) => {
			this.credentials.set(
				credential.id,
				new AccountCredentialRecord(this.#client, credential)
			);
		});
	}
}
