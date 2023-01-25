import { useState } from "react";
import { Form, redirect } from "react-router-dom";
import { createAccount, getAccountOnboardingLink } from "./apiClient";

export async function action() {
    const { id } = await createAccount()
    const data = {
        "refresh_url": `${window.location.origin}/accounts/${id}`,
        "return_url": `${window.location.origin}/accounts/${id}`
    }
    const { url } = await getAccountOnboardingLink(id, data)
    return redirect(url)
}

const AccountOnboarding = () => {
    const [loading, setLoading] = useState(false)
    return (
        <div>
            <h2>Create a new Stripe Account</h2>
            <Form method="POST" onSubmit={() => setLoading(true)}>
                <button type="submit" disabled={loading}>Get Started</button>
            </Form>
        </div>
    );
}

export default AccountOnboarding;