import type { Role } from "@0x57/schemas";
import type { BitField } from "bitflag-js";
import type { Hex57 } from "../client.js";
import PersistentBitField from "./PersistedBitField.js";

export default class RoleRecord {
	id: string;
	name: string;
	permissions: PersistentBitField;
	updatedAt: Date;
	createdAt: Date;
	readonly #client;

	constructor(client: Hex57, record: Role) {
		this.#client = client;
		this.id = record.id;
		this.name = record.name;
		this.permissions = new PersistentBitField(
			this.#savePermissions,
			record.permissions
		);
		this.updatedAt = record.updatedAt;
		this.createdAt = record.createdAt;
	}

	async update(params: {
		name?: string;
		permissions?: bigint | BitField | PersistentBitField;
	}) {
		const result = await this.#client.updateRole(this.id, params);
		this.#initialize(result);
	}

	async delete() {
		return this.#client.deleteRole(this.id);
	}

	async refresh() {
		const record = await this.#client.getRole(this.id);
		this.#initialize(record);
	}

	async #savePermissions() {
		return this.update({ permissions: this.permissions.value });
	}

	#initialize(record: Role) {
		this.name = record.name;
		this.permissions = new PersistentBitField(
			this.#savePermissions,
			record.permissions
		);
		this.updatedAt = record.updatedAt;
		this.createdAt = record.createdAt;
	}
}
