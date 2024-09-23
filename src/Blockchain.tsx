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
   /* async function connectToBlockchain() {

        const client = await StargateClient.connect(rpcUrl);
        console.log("Connected to Cosmos blockchain:", await client.getChainId());
        return client;
    }
    */
    // function to update the blog on the blockchain
    async function updateBlogOnChain() {
        const currentWallet = await createWalletIfNeeded(); // to ensure the walet is created
        // const blockchainClient = await connectToBlockchain(); // to ensure the client is connected
        const client = await SigningStargateClient.connectWithSigner(rpcUrl, currentWallet);
        const account = (await currentWallet!.getAccounts())[0];
        console.log("Account address:", account.address);

        // define transaction details dynamically
        const amount = coins(0, "uatom");
        const fee = {
            amount: coins(200, "uatom"),
            gas: "180000",
        }
        const memo = `Blog reference: ${blogHash}`;

        // update blog transaction
        try {
            const result = await client.sendTokens(account.address, account.address, amount, fee, memo);
            console.log("Transaction sent:", result);
        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            client.disconnect();
        }

    }

    // function to send tips to the blog author
    async function sendTips() {
        const currentWallet = await createWalletIfNeeded(); // to ensure the walet is created
        // const blockchainClient = await connectToBlockchain(); // to ensure the client is connected
        const client = await SigningStargateClient.connectWithSigner(rpcUrl, currentWallet);
        const account = (await currentWallet!.getAccounts())[0];
        console.log("Account address:", account.address);

        // define transaction details dynamically
        const amount = coins(amountInUatom, "uatom");
        const fee = {
            amount: coins(200, "uatom"),
            gas: "180000",
        }
        const memo = `Tip to: ${recipient}`;

        // send tip transaction
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
        await updateBlogOnChain();
    }

    // function to handle sending tips
    const handleSendTips = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendTips();
    }
    
    return (
        <div>
            <h1>Blockchain</h1>
            <form onSubmit={handleSubmit}>
                <h2>Update Blog on Chain</h2>
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
                <button type="submit">update blog TX</button>
            </form>

            {/* form to send tips */}
            <form onSubmit={handleSendTips}>
                <h2>Send tip</h2>
                <br />
                <label htmlFor="">
                    Recipient address:
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
                <button type="submit">Send Tip TX</button>
            </form>
        </div>
    );
}

export default Blockchain;

