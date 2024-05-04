import type { Role } from "@0x57/schemas";
import { BitField } from "bitflag-js";
import type { Hex57 } from "../client.js";

export default class RoleRecord {
	readonly #client;
	readonly #id: string;
	#name: string;
	#permissions: BitField;
	#updatedAt: Date;
	#createdAt: Date;

	constructor(client: Hex57, record: Role) {
		this.#client = client;
		this.#id = record.id;
		this.#name = record.name;
		this.#permissions = new BitField(record.permissions);
		this.#updatedAt = record.updatedAt;
		this.#createdAt = record.createdAt;
	}

	get id() {
		return this.#id;
	}

	get name() {
		return this.#name;
	}

	get permissions() {
		return this.#permissions;
	}

	get updatedAt() {
		return this.#updatedAt;
	}

	get createdAt() {
		return this.#createdAt;
	}

	setName(name: string) {
		this.#name = name;
		return this;
	}

	async save() {
		const result = await this.#client.rest.patchRole(this.id, {
			name: this.#name,
			permissions: this.#permissions,
		});
		this.#initialize(result);
	}

	async delete() {
		return this.#client.deleteRole(this.id);
	}

	async refresh() {
		const record = await this.#client.rest.getRole(this.id);
		this.#initialize(record);
	}

	#initialize(record: Role) {
		this.#name = record.name;
		this.#permissions = new BitField(record.permissions);
		this.#updatedAt = record.updatedAt;
		this.#createdAt = record.createdAt;
	}
}
