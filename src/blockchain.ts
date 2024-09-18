import { StargateClient, SigningStargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

const rpcUrl = "https://rpc-testnet.cosmos.network"; // rpc endpoint
let wallet: DirectSecp256k1HdWallet; // wallet to sign transactions

// function to connect to the Cosmos network
async function connectToBlockchain() {
    const client = await StargateClient.connect(rpcUrl);
    console.log("Connected to Cosmos blockchain:", await client.getChainId());
    return client;
}

// function to create a wallet if none exists
async function createWalletIfNeeded() {
    if (!wallet) {
        const mnemonic = process.env.MNEMONIC;
        wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: "cosmos",
        });
    }
    return wallet;
}

// function to create a signing client
export async function createWalletandSendTx(mnemonic: string) {
    createWalletIfNeeded();
    const client = await SigningStargateClient.connectWithSigner(rpcUrl, wallet);
    const account = (await wallet.getAccounts())[0];
    console.log("Account address:", account.address);

    // send a transaction
}