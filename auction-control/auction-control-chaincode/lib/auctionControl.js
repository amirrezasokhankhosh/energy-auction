"use strict";

const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class AuctionControl extends Contract {
	async InitResources(ctx) {
		const resources = [
			{
				id: "resource_0",
				volume: 100,
				price: 100,
				type: "generation",
			},
			{
				id: "resource_1",
				volume: 80,
				price: 400,
				type: "generation",
			},
			{
				id: "resource_2",
				volume: 60,
				price: 300,
				type: "storage",
			},
			{
				id: "resource_3",
				volume: 40,
				price: 200,
				type: "storage",
			},
		];
		for (const resource of resources) {
			await ctx.stub.putState(
				resource.id,
				Buffer(stringify(sortKeysRecursive(resource)))
			);
		}
	}

	async ResourceExists(ctx, id) {
		const resourceBytes = await ctx.stub.getState(id);
		return resourceBytes && resourceBytes.length > 0;
	}

	async CreateResource(ctx, id, volume, price, type) {
		const exists = await this.ResourceExists(ctx, id);
		if (exists) {
			throw Error(`A resource already exists with id: ${id}`);
		}

		const resource = {
			id: id,
			volume: parseFloat(volume),
			price: parseFloat(price),
			type: type,
		};

		await ctx.stub.putState(
			resource.id,
			Buffer(stringify(sortKeysRecursive(resource)))
		);
		return JSON.stringify(resource);
	}

	async ReadResource(ctx, id) {
		const resourceBytes = await ctx.stub.getState(id);
		if (!resourceBytes || resourceBytes.length === 0) {
			throw Error(`No resource exists with id: ${id}`);
		}

		return resourceBytes.toString();
	}

	async GetAllResources(ctx) {
		const allResults = [];
		const iterator = await ctx.stub.getStateByRange("", "");
		let result = await iterator.next();
		while (!result.done) {
			const strValue = Buffer.from(
				result.value.value.toString()
			).toString("utf8");
			let record;
			try {
				record = JSON.parse(strValue);
			} catch (err) {
				console.log(err);
				record = strValue;
			}
			if (record.id.startsWith("resource_")) {
				allResults.push(record);
			}
			result = await iterator.next();
		}
		return JSON.stringify(allResults);
	}

	async SortResources(ctx) {
		const resourcesString = await this.GetAllResources(ctx);
		const resources = JSON.parse(resourcesString);

		resources.sort((a, b) => a.price - b.price);

		return JSON.stringify(resources);
	}

	async UpdateResource(ctx, id, volume, price, type) {
		const exists = await this.ResourceExists(ctx, id);
		if (!exists) {
			throw Error(`No resource exists with id: ${id}`);
		}

		const resource = {
			id: id,
			volume: parseFloat(volume),
			price: parseFloat(price),
			type: type,
		};

		await ctx.stub.putState(
			resource.id,
			Buffer(stringify(sortKeysRecursive(resource)))
		);

		return JSON.stringify(resource);
	}

	async DeleteResource(ctx, id) {
		const exists = await this.ResourceExists(ctx, id);
		if (!exists) {
			throw Error(`No resource exists with id: ${id}`);
		}

		await ctx.stub.deleteState(id);
	}
}

module.exports = AuctionControl;
