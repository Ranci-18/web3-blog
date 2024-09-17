import { StargateClient, SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

const rpcUrl = "https://rpc-testnet.cosmos.network"; // rpc endpoint

// function to connect to the Cosmos network
async function connectToBlockchain() {
    const client = await StargateClient.connect(rpcUrl);
    console.log("Connected to Cosmos blockchain:", await client.getChainId());
    return client;
}