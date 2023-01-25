import { useLoaderData } from "react-router-dom";
import { getAccount } from "./apiClient";

export const loader = async ({ accountId }) => {
    const account = await getAccounts(accountId);
    return { account };
}


const Account = () => {
    const { account } = useLoaderData()
    return null;
}

export default Account