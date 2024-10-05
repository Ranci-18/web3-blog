import Blockchain from "./Blockchain";
import Blog from "./Blog";
import '../sass/app.sass';

const App: React.FC = () => {
    return (
        <div className="app">
            <h1>Web3 Blog dApp</h1>
            <div>
                <Blog />
                <Blockchain />
            </div>
        </div>
    );
}

export default App;