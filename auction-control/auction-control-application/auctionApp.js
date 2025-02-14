"use Strict";

const { TextDecoder } = require("util");

class AuctionApp {
	constructor() {
		this.utf8decoder = new TextDecoder();
	}

	async initResources(contract) {
		try {
			await (await contract).submitTransaction("InitResources");
			return "All resources are successfully initiated.";
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async createResource(contract, id, volume, price, type) {
		try {
			const resourceBytes = await (
				await contract
			).submitTransaction("CreateResource", id, volume, price, type);
			const resourceString = this.utf8decoder.decode(resourceBytes);
			return JSON.parse(resourceString);
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async readResource(contract, id) {
		try {
			const resourceBytes = await (
				await contract
			).evaluateTransaction("ReadResource", id);
			const resourceString = this.utf8decoder.decode(resourceBytes);
			return JSON.parse(resourceString);
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async getAllResources(contract) {
		try {
			const resourcesBytes = await (
				await contract
			).evaluateTransaction("GetAllResources");
			const resourcesString = this.utf8decoder.decode(resourcesBytes);
			return JSON.parse(resourcesString);
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async sortResources(contract) {
		try {
			const resourcesBytes = await (
				await contract
			).evaluateTransaction("SortResources");
			const resourcesString = this.utf8decoder.decode(resourcesBytes);
			return JSON.parse(resourcesString);
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async updateResource(contract, id, volume, price, type) {
		try {
			const resourceBytes = await (
				await contract
			).submitTransaction("UpdateResource", id, volume, price, type);
			const resourceString = this.utf8decoder.decode(resourceBytes);
			return JSON.parse(resourceString);
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async deleteResource(contract, id) {
		try {
			await (await contract).submitTransaction("DeleteResource", id);
			return "Resource was successfully deleted.";
		} catch (error) {
			console.log(error);
			return error;
		}
	}
}

module.exports = {
	AuctionApp,
};
