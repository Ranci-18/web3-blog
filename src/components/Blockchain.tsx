import { useState, useEffect } from "react";
import { StargateClient, SigningStargateClient } from "@cosmjs/stargate";
import { coins, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import '../sass/blockchain.sass';

// Define the expected structure for the decoded transaction
interface DecodedTx {
    body?: {
        memo?: string;
    };
}

// Add this utility function to decode transactions
function decodeTx(tx: Uint8Array): DecodedTx {
    // Implement the decoding logic here
    // This is a placeholder; replace with actual decoding logic
    return { body: { memo: "Decoded memo" } }; // Return the decoded transaction object with a body
}

const Blockchain: React.FC = () => {
    const [blogContent, setBlogContent] = useState<string>(""); // original blog content
    const [recipient, setRecipient] = useState<string>(""); // recipient address
    const [amountInUatom, setAmountinUatom] = useState<number>(0); // amount to send
    const [mnemonic1, setMnemonic1] = useState<string>(""); // mnemonic1
    const [mnemonic2, setMnemonic2] = useState<string>(""); // mnemonic2
    const [transactions, setTransactions] = useState<{timestamp: string, content?: string}[]>([]);
    // Update RPC URL to point to local Ignite chain
    const rpcUrl = "http://localhost:26657";

    // function to create a wallet if none exists
    async function createWallet(mnemonic: string) {
        if (!mnemonic) {
            throw new Error("Mnemonic is not defined");
        }
        return await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix: "cosmos", // Make sure this matches your local chain's prefix
        });
    }

    // Improved function to store blog content on chain
    async function updateBlogOnChain() {
        let client: SigningStargateClient | null = null;
        try {
            const wallet = await createWallet(mnemonic1);
            client = await SigningStargateClient.connectWithSigner(rpcUrl, wallet);
            const account = (await wallet.getAccounts())[0];

            // Validate content
            if (!blogContent.trim()) {
                throw new Error("Blog content cannot be empty");
            }

            // Prepare the transaction
            const burnAddress = "cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a";
            const minimalAmount = coins(1, "stake");
            
            // Store the blog content directly in the memo
            const memo = blogContent;

            const result = await client.sendTokens(
                account.address,
                burnAddress,
                minimalAmount,
                {
                    amount: coins(0, "stake"),
                    gas: "200000",
                },
                memo
            );

            console.log("Blog content stored on chain. TX Hash:", result.transactionHash);
            
            // Add new blog post to transactions immediately
            setTransactions(prev => [{
                timestamp: new Date().toLocaleString(),
                content: blogContent,
            }, ...prev]);

            return result.transactionHash;
        } catch (error) {
            console.error("Failed to store blog content:", error);
            throw error;
        } finally {
            if (client) {
                await client.disconnect();
            }
        }
    }

    // Fixed function to fetch and parse blog content from chain
    async function fetchBlogContent() {
        try {
            const client = await StargateClient.connect(rpcUrl);
            const burnAddress = "cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a";
    
            // Fetch all transactions for the burn address
            const txs = await client.searchTx([
                {
                    key: "transfer.recipient",
                    value: burnAddress,
                },
            ]);
    
            const blogPosts = await Promise.all(txs.map(async (tx) => {
                try {
                    // Decode the transaction to access its properties
                    const decodedTx = await client.getTx(tx.hash);
                    if (!decodedTx || !decodedTx.tx) return null; // Ensure tx exists

                    // Decode the transaction if it's a Uint8Array
                    const txData = decodedTx.tx instanceof Uint8Array ? decodeTx(decodedTx.tx) : decodedTx.tx; // Use a decoding function

                    const block = await client.getBlock(tx.height);
    
                    // Access the memo from the decoded transaction's body
                    const memo = txData.body?.memo; // Ensure to access body first

                    if (!memo) return null;
    
                    return {
                        timestamp: new Date(block.header.time).toLocaleString(),
                        content: memo,
                    };
                } catch (e) {
                    console.error("Failed to parse blog data for tx:", tx.hash, e);
                    return null;
                }
            }));
    
            // Filter out nulls and sort by timestamp (newest first)
            const validPosts = blogPosts
                .filter((post): post is NonNullable<typeof post> => post !== null)
                .sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
    
            console.log("Retrieved blog posts:", validPosts);
            return validPosts;
    
        } catch (error) {
            console.error("Failed to fetch blog content:", error);
            throw error;
        }
    }
    

    // Use effect to load blog content on component mount
    useEffect(() => {
        const loadBlogContent = async () => {
            try {
                const posts = await fetchBlogContent();
                setTransactions(posts as {timestamp: string, content?: string}[]);
            } catch (error) {
                console.error("Failed to load blog content:", error);
            }
        };

        loadBlogContent();
        
        // Refresh every 30 seconds
        const interval = setInterval(loadBlogContent, 30000);
        return () => clearInterval(interval);
    }, []);

    // function to send tips to the blog author
    async function sendTips() {
        let client: SigningStargateClient | null = null;
        try {
            const wallet = await createWallet(mnemonic2);
            client = await SigningStargateClient.connectWithSigner(rpcUrl, wallet);
            const account = (await wallet.getAccounts())[0];
            console.log("Account address:", account.address);

            if (!recipient) {
                throw new Error("Recipient address is required");
            }

            // define transaction details
            const amount = coins(amountInUatom, "stake"); // Use stake token
            const fee = {
                amount: coins(0, "stake"),
                gas: "200000",
            }
            const memo = `Tip to: ${recipient}`;

            const result = await client.sendTokens(
                account.address,
                recipient,
                amount,
                fee,
                memo
            );
            
            console.log("Transaction hash:", result.transactionHash);
            
            // Add transaction to history
            setTransactions(prev => [{
                timestamp: new Date().toLocaleString(),
                content: `Tip sent to ${recipient}`,
            }, ...prev]);
            
            alert(`Tip sent successfully! Hash: ${result.transactionHash}`);
            
        } catch (error) {
            console.error("Failed to send tip:", error);
            alert(`Failed to send tip: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            if (client) {
                await client.disconnect();
            }
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateBlogOnChain();
            setBlogContent(""); // Clear the form
            alert("Blog post successfully stored on chain!");
        } catch (error) {
            alert(`Failed to store blog post: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // function to handle sending tips
    const handleSendTips = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendTips();
    }
    
    return (
        <div className="blockchain">
            <h1>Blockchain</h1>
            <form onSubmit={handleSubmit}>
                <h2>Update Blog on Chain</h2>
                <label htmlFor="blogContent">
                    Blog Content:
                    <textarea
                        id="blogContent"
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        required
                        rows={10}
                        cols={50}
                        placeholder="Write your blog post here..."
                        style={{ 
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            resize: 'vertical'
                        }}
                    />
                </label>
                <br />
                <label htmlFor="updateMnemonic">
                    Update Blog Mnemonic:
                    <input
                        id="updateMnemonic"
                        type="text"
                        value={mnemonic1}
                        onChange={(e) => setMnemonic1(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button type="submit">update blog TX</button>
            </form>
            <hr />
            {/* form to send tips */}
            <form onSubmit={handleSendTips}>
                <h2>Send tip</h2>
                
                <label htmlFor="recipientAddress">
                    Recipient address:
                    <input
                        id="recipientAddress"
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label htmlFor="amount">
                    Amount (uatom):
                    <input
                        id="amount"
                        type="number"
                        value={amountInUatom}
                        onChange={(e) => setAmountinUatom(Number(e.target.value))}
                        required
                    />
                </label>
                <br />
                <label htmlFor="tipMnemonic">
                    Tip Mnemonic:
                    <input
                        id="tipMnemonic"
                        type="text"
                        value={mnemonic2}
                        onChange={(e) => setMnemonic2(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button type="submit">Send Tip TX</button>
            </form>
            
            {/* Transaction History Section */}
            <div className="transaction-history">
                <h2>Blog History</h2>
                {transactions.length === 0 ? (
                    <p>No blog updates yet</p>
                ) : (
                    <ul>
                        {transactions.map((tx, index) => (
                            <li key={index} className="blog-post">
                                <div className="blog-content">
                                    {tx.content}
                                </div>
                                <div className="blog-meta">
                                    {tx.timestamp}
                                </div>
                                <hr/>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Blockchain;
