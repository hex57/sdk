import type { Organization } from "@0x57/schemas";
import { BitField } from "bitflag-js";
import type { Hex57 } from "../client.js";

export default class OrganizationRecord {
	readonly #client;
	readonly #id: string;
	#name: string;
	#flags: BitField;
	#updatedAt: Date;
	#createdAt: Date;

	constructor(client: Hex57, record: Organization) {
		this.#client = client;
		this.#id = record.id;
		this.#name = record.name;
		this.#flags = new BitField(record.flags);
		this.#updatedAt = record.updatedAt;
		this.#createdAt = record.createdAt;
	}

	get id() {
		return this.#id;
	}

	get name() {
		return this.#name;
	}

	get flags() {
		return this.#flags;
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
		const result = await this.#client.rest.patchOrganization(this.id, {
			name: this.#name,
			flags: this.#flags,
		});
		this.#initialize(result);
	}

	async delete() {
		return this.#client.deleteOrganization(this.id);
	}

	async refresh() {
		const record = await this.#client.rest.getOrganization(this.id);
		this.#initialize(record);
	}

	#initialize(record: Organization) {
		this.#name = record.name;
		this.#flags = new BitField(record.flags);
		this.#updatedAt = record.updatedAt;
		this.#createdAt = record.createdAt;
	}
}
