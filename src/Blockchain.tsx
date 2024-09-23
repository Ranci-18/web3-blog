import { useState } from "react";
import { StargateClient, SigningStargateClient } from "@cosmjs/stargate";
import { coins, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

const Blockchain: React.FC = () => {
    const [blogHash, setBlogHash] = useState<string>(""); // hash of the blog
    const [recipient, setRecipient] = useState<string>(""); // recipient address
    const [amountInUatom, setAmountinUatom] = useState<string>(""); // amount to send
    const [mnemonic, setMnemonic] = useState<string>(""); // mnemonic
    const rpcUrl = "http://0.0.0.0:26657"; // rpc endpoint
    let wallet: DirectSecp256k1HdWallet; // wallet to sign transactions

    // function to create a wallet if none exists
    async function createWalletIfNeeded() {
        if (!wallet) {
            const mnemonic = process.env.MNEMONIC;
            if (!mnemonic) {
                throw new Error("Mnemonic is not defined");
            }
            wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: "cosmos",
            });
        }
        return wallet;
    }
    
    // function to connect to the Cosmos network
    async function connectToBlockchain() {
        const client = await StargateClient.connect(rpcUrl);
        console.log("Connected to Cosmos blockchain:", await client.getChainId());
        return client;
    }

    // function to create a signing client and send a transaction
    async function createWalletandSendTx() {
        await createWalletIfNeeded(); // to ensure the walet is created
        const client = await SigningStargateClient.connectWithSigner(rpcUrl, wallet);
        const account = (await wallet!.getAccounts())[0];
        console.log("Account address:", account.address);

        // define transaction details dynamically
        const amount = coins(amountInUatom, "uatom");
        const fee = {
            amount: coins(200, "uatom"),
            gas: "180000",
        }
        const memo = `Blog reference: ${blogHash}`;

        // send transaction
        try {
            const result = await client.sendTokens(account.address, recipient, amount, fee, memo);
            console.log("Transaction sent:", result);
        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            client.disconnect();
        }

    }

    // function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createWalletandSendTx();
    }
    
    return (
        <div>
            <h1>Blockchain</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="">
                    Blog Hash:
                    <input
                        type="text"
                        value={blogHash}
                        onChange={(e) => setBlogHash(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label htmlFor="">
                    Mnemonic:
                    <input
                        type="text"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label htmlFor="">
                    Recipient:
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label htmlFor="">
                    Amount (uatom):
                    <input
                        type="text"
                        value={amountInUatom}
                        onChange={(e) => setAmountinUatom(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button type="submit">Send Transaction</button>
            </form>
        </div>
    );
}

export default Blockchain;

