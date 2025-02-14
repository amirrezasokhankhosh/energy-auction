"use strict";

const {
	AuctionApp,
} = require("../auction-control/auction-control-application/auctionApp");
const auctionApp = new AuctionApp();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const jsonParser = bodyParser.json();
const port = 3000;

const crypto = require("crypto");
const grpc = require("@grpc/grpc-js");
const {
	connect,
	Contract,
	Identity,
	Signer,
	signers,
} = require("@hyperledger/fabric-gateway");
const fs = require("fs/promises");
const path = require("path");

const mspId = "Org1MSP";

const cryptoPath = path.resolve(
	__dirname,
	"..",
	"test-network",
	"organizations",
	"peerOrganizations",
	"org1.example.com"
);
const keyDirPath = path.resolve(
	cryptoPath,
	"users",
	"User1@org1.example.com",
	"msp",
	"keystore"
);
const certPath = path.resolve(
	cryptoPath,
	"users",
	"User1@org1.example.com",
	"msp",
	"signcerts",
	"User1@org1.example.com-cert.pem"
);
const tlsCertPath = path.resolve(
	cryptoPath,
	"peers",
	"peer0.org1.example.com",
	"tls",
	"ca.crt"
);

const peerEndPoint = "localhost:7051";
const peerHostAlias = "peer0.org1.example.com";

const contractAuction = InitConnection("main", "auctionCC");

async function newGrpcConnection() {
	const tlsRootCert = await fs.readFile(tlsCertPath);
	const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
	return new grpc.Client(peerEndPoint, tlsCredentials, {
		"grpc.ssl_target_name_override": peerHostAlias,
		"grpc.max_send_message_length": 100 * 1024 * 1024,
		"grpc.max_receive_message_length": 100 * 1024 * 1024,
	});
}

async function newIdentity() {
	const credentials = await fs.readFile(certPath);
	return {
		mspId,
		credentials,
	};
}

async function newSigner() {
	const files = await fs.readdir(keyDirPath);
	const keyPath = path.resolve(keyDirPath, files[0]);
	const privateKeyPem = await fs.readFile(keyPath);
	const privateKey = crypto.createPrivateKey(privateKeyPem);
	return signers.newPrivateKeySigner(privateKey);
}

async function InitConnection(channelName, chaincodeName) {
	/*
	 * Returns a contract for a given channel and chaincode.
	 * */
	const client = await newGrpcConnection();

	const gateway = connect({
		client,
		identity: await newIdentity(),
		signer: await newSigner(),
		// Default timeouts for different gRPC calls
		evaluateOptions: () => {
			return {
				deadline: Date.now() + 500000,
			}; // 5 seconds
		},
		endorseOptions: () => {
			return {
				deadline: Date.now() + 1500000,
			}; // 15 seconds
		},
		submitOptions: () => {
			return {
				deadline: Date.now() + 500000,
			}; // 5 seconds
		},
		commitStatusOptions: () => {
			return {
				deadline: Date.now() + 6000000,
			}; // 1 minute
		},
	});

	const network = gateway.getNetwork(channelName);

	return network.getContract(chaincodeName);
}

app.get('/', (req, res) => {
    res.send("Hello World!.");
});

app.get('/exit', (req, res) => {
    process.exit();
});

app.post("/api/resources/", async (req, res) => {
	const message = await auctionApp.initResources(contractAuction);
	res.send(message);
});

app.post("/api/resource/", jsonParser, async (req, res) => {
	const message = await auctionApp.createResoure(
		contractAuction,
		req.body.id,
		req.body.volume.toString(),
		req.body.price.toString(),
		req.body.type
	);
    res.send(message);
});

app.get("/api/resource", jsonParser, async (req, res) => {
    const message = await auctionApp.readResource(contractAuction, req.body.id);
    res.send(message);
});

app.get("/api/resources", jsonParser, async (req, res) => {
    const message = await auctionApp.getAllResources(contractAuction);
    res.send(message);
});

app.get("/api/resources/sorted/", jsonParser, async (req, res) => {
    const message = await auctionApp.sortResources(contractAuction);
    res.send(message);
});

app.put("/api/resource/", jsonParser, async (req, res) => {
    const message = await auctionApp.updateResource(
		contractAuction,
		req.body.id,
		req.body.volume.toString(),
		req.body.price.toString(),
		req.body.type
	);
    res.send(message);
});

app.delete("/api/resource/", jsonParser, async (req, res) => {
    const message = await auctionApp.deleteResource(contractAuction, id);
    res.send(message);
});

app.listen(port, () => {
	console.log(`Server is listening on localhost:${port}.\n`);
});
