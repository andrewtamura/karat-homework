import { Link, useLoaderData } from "react-router-dom";
import { getAccount, getAccountUpdateLink } from "./apiClient";

export const loader = async ({ params }) => {
    return await getAccount(params.accountId);
}

const Account = () => {
    const account = useLoaderData()
    return (
        <div>
            <h2>{account.data.company.name}</h2>
            <button onClick={async (event) => {
                event.preventDefault();
                const data = {
                    "refresh_url": `${window.location.origin}/account/${account.id}`,
                    "return_url": `${window.location.origin}/account/${account.id}`
                }
                const { url } = await getAccountUpdateLink(account.id, data)
                window.href = url;
            }}>Update</button>
            <h2>Cardholders</h2>
            <Link to={`/cardholders/new`}>Add a cardholder</Link>
            {account.cardholders.length ? (
                <ul>
                    {account.cardholders.map(({ data }) => <li>{data.id}</li>)}
                </ul>
            ) : (<p>No cardholders yet</p>)}
            <h2>Cards</h2>
            <Link to={`/cards/new`}>Add a card</Link>
            {account.cards.length ? (
                <ul>
                    {account.cards.map(({ data }) => <li>{data.id}</li>)}
                </ul>
            ) : (<p>No cards yet</p>)}
        </div>
    );
}

export default Account