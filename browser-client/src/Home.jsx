import { Link, Outlet, useLoaderData } from "react-router-dom";
import { getAccounts } from "./apiClient";

export const loader = async () => {
    const accounts = await getAccounts();
    return { accounts };
}

const Home = () => {
    const { accounts } = useLoaderData();
    return (
        <div className="App">
            <h1>Carrot Card</h1>
            <nav>
                {accounts.length ? (
                    <ul>
                        {accounts.map(({ name, id }) => (<li><Link to={`/accounts/${id}`}>{name}</Link></li>))}
                    </ul>
                ) : <p>No accounts</p>}
            </nav>
            <div>
                <Outlet />
            </div>
        </div>
    );
}

export default Home;