import Blockchain from "./Blockchain";
import Blog from "./Blog";

const App: React.FC = () => {
    return (
        <>
            <h1>Web3 Blog dApp</h1>
            <div>
                <Blog />
                <Blockchain />
            </div>
        </>
    );
}

export default App;