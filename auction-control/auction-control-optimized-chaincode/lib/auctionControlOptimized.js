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
                Buffer.from(stringify(sortKeysRecursive(resource)))
            );
        }
    }

    async KeyExists(ctx, id) {
        const valueBytes = await ctx.stub.getState(id);
        return valueBytes && valueBytes.length > 0;
    }

    async CreateResource(ctx, id, volume, price, type) {
        const exists = await this.KeyExists(ctx, id);
        if (exists) {
            throw Error(`A resource already exists with id: ${id}`);
        }

        const resource = {
            id: id,
            volume: parseFloat(volume),
            price: parseFloat(price),
            type: type,
            buyer_bid_id: null,
            sold_price: null,
        };

        await ctx.stub.putState(
            resource.id,
            Buffer.from(stringify(sortKeysRecursive(resource)))
        );
        return JSON.stringify(resource);
    }

    async ReadKey(ctx, id) {
        const valueBytes = await ctx.stub.getState(id);
        if (!valueBytes || valueBytes.length === 0) {
            throw Error(`No value exists for key: ${id}`);
        }

        return valueBytes.toString();
    }

    async GetAllValues(ctx, value_type) {
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
            if (record.id.startsWith(`${value_type}_`)) {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async SortResources(ctx) {
        const resourcesString = await this.GetAllValues(ctx, "resource");
        const resources = JSON.parse(resourcesString);

        resources.sort((a, b) => a.price - b.price);

        return JSON.stringify(resources);
    }

    async DeleteKey(ctx, id) {
        const exists = await this.KeyExists(ctx, id);
        if (!exists) {
            throw Error(`No value exists for key: ${id}`);
        }

        await ctx.stub.deleteState(id);
    }

    async ReadBid(ctx, id, resource_id) {
        const compositeKey = ctx.stub.createCompositeKey("bid", [resource_id, id]);
        return await this.ReadKey(ctx, compositeKey);
    }

    async CreateBid(ctx, id, resource_id, price) {
        const compositeKey = ctx.stub.createCompositeKey("bid", [resource_id, id])
        const exists = await this.KeyExists(ctx, compositeKey);
        if (exists) {
            throw Error(`A bid already exists with id ${id}`);
        }

        const bid = {
            id: id,
            resource_id: resource_id,
            price: parseFloat(price),
        };

        await ctx.stub.putState(
            compositeKey,
            Buffer.from(stringify(sortKeysRecursive(bid)))
        );
        return JSON.stringify(bid);
    }

    async GetAllBids(ctx, resource_id) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByPartialCompositeKey("bid", [resource_id]);
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
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults)
    }

    async EndEnglishAuction(ctx, resource_id) {
        const bidsString = await this.GetAllBids(ctx, resource_id);
        let bids = JSON.parse(bidsString);

        bids.sort((a, b) => b.price - a.price);
        const buyer_bid = bids[0];

        const resourceString = await this.ReadKey(ctx, resource_id);
        const resource = JSON.parse(resourceString);
        resource.buyer_bid_id = buyer_bid.id;
        resource.sold_price = buyer_bid.price;

        await ctx.stub.putState(
            resource.id,
            Buffer.from(stringify(sortKeysRecursive(resource)))
        );

        return JSON.stringify(resource);
    }

    async EndSecondPriceAuction(ctx, resource_id) {
        const bidsString = await this.GetAllBids(ctx, resource_id);
        let bids = JSON.parse(bidsString);

        bids.sort((a, b) => b.price - a.price);
        const buyer_bid = bids[1];

        const resourceString = await this.ReadKey(ctx, resource_id);
        const resource = JSON.parse(resourceString);
        resource.buyer_bid_id = buyer_bid.id;
        resource.sold_price = buyer_bid.price;

        await ctx.stub.putState(
            resource.id,
            Buffer.from(stringify(sortKeysRecursive(resource)))
        );

        return JSON.stringify(resource);
    }
}

module.exports = AuctionControl;