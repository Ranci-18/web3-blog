import { useState } from "react";
import { createWalletandSendTx } from "../blockchain";

// function to handle the mnemonic input
const MnemonicInput: React.FC = () => {
    const [mnemonic, setMnemonic] = useState<string>("");

    // update the mnemonic state
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMnemonic(event.target.value);
    };

    // on submit call the blockchain function
    const handleSubmit = async () => {
        try {
            await createWalletandSendTx(mnemonic);
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <>
            <input
                type="text"
                value={mnemonic}
                onChange={handleChange}
                placeholder="Enter your mnemonic"
            />
            <button onClick={handleSubmit}>Submit</button>
        </>
    )
}

export default MnemonicInput;