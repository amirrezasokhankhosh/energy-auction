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

	async readKey(contract, id) {
		try {
			const resourceBytes = await (
				await contract
			).evaluateTransaction("ReadKey", id);
			const resourceString = this.utf8decoder.decode(resourceBytes);
			return JSON.parse(resourceString);
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async getAllValues(contract, value_type) {
		try {
			const resourcesBytes = await (
				await contract
			).evaluateTransaction("GetAllValues", value_type);
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

	async deleteKey(contract, id) {
		try {
			await (await contract).submitTransaction("DeleteKey", id);
			return "Resource was successfully deleted.";
		} catch (error) {
			console.log(error);
			return error;
		}
	}

	async createBid(contract, id, resource_id, price) {
		try {
			const bidBytes = await (await contract).submitTransaction("CreateBid", id, resource_id, price);
			const bidString = this.utf8decoder.decode(bidBytes);
			return JSON.stringify(bidString);
		} catch(error) {
			console.log(error);
			return error;
		}
	}

	async getAllBids(contract, resource_id) {
		try {
			const bidsBytes = await (await contract).evaluateTransaction("GetAllBids", resource_id);
			const bidsString = this.utf8decoder.decode(bidsBytes);
			return JSON.stringify(bidsString);
		} catch(error) {
			console.log(error);
			return error;
		}
	}

	async endEnglishAuction(contract, resource_id) {
		try {
			const resourceBytes = await (await contract).submitTransaction("EndEnglishAuction", resource_id);
			const resourceString = this.utf8decoder.decode(resourceBytes);
			return JSON.stringify(resourceString);
		} catch(error) {
			console.log(error);
			return error;
		}
	}

	async endSecondPriceAuction(contract, resource_id) {
		try {
			const resourceBytes = await (await contract).submitTransaction("EndSecondPriceAuction", resource_id);
			const resourceString = this.utf8decoder.decode(resourceBytes);
			return JSON.stringify(resourceString);
		} catch(error) {
			console.log(error);
			return error;
		}
	}
}

module.exports = {
	AuctionApp,
};
