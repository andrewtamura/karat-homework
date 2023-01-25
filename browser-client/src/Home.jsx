import { Link, Outlet, useLoaderData } from "react-router-dom";
import { getAccounts } from "./apiClient";

export const loader = async () => {
    return await getAccounts();
}

const Home = () => {
    const accounts = useLoaderData();
    return (
        <div className="App">
            <h1><Link to="/">Carrot Financial</Link></h1>
            <nav>
                <h2>Accounts</h2>
                {accounts.length ? (
                    <ul>
                        {accounts.map(({ id }) => (<li key={id}><Link to={`/accounts/${id}`}>{id}</Link></li>))}
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