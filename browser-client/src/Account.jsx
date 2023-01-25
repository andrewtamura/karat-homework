import { Link, Form, redirect, useLoaderData } from "react-router-dom";
import { getAccount, getAccountUpdateLink } from "./apiClient";
import { useState } from "react"
export const loader = async ({ params }) => {
    return await getAccount(params.accountId);
}

export async function action({ params }) {
    const data = {
        "refresh_url": `${window.location.origin}/accounts/${params.accountId}`,
        "return_url": `${window.location.origin}/accounts/${params.accountId}`
    }
    const { url } = await getAccountUpdateLink(params.accountId, data)
    return redirect(url)
}

const Account = () => {
    const account = useLoaderData()
    const accountName = account.data.id
    const [loading, setLoading] = useState(false)
    return (
        <div>
            <h2>{accountName}</h2>
            <Form method="POST" onSubmit={() => setLoading(true)}>
                <button type="submit" disabled={loading}>Update Account</button>
            </Form>

            <h2>Cardholders</h2>
            <Link to={`cardholders/new`}>Add a cardholder</Link>
            {account.cardholders.length ? (
                <ul>
                    {account.cardholders.map(({ data }) => <li key={data.id}>{data.id}</li>)}
                </ul>
            ) : (<p>No cardholders yet</p>)}

            <h2>Cards</h2>
            <Link to={`cards/new`} >Add a card</Link>
            {account.cards.length ? (
                <ul>
                    {account.cards.map(({ data }) => <li key={data.id}>{data.id}</li>)}
                </ul>
            ) : (<p>No cards yet</p>)}
        </div>
    );
}

export default Account