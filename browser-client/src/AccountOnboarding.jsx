import { useState } from "react";
import { createAccount, getAccountOnboardingLink } from "./apiClient";

const AccountOnboarding = () => {
    const [loading, setLoading] = useState(false)

    return (
        <div>
            <h2>Create a new Stripe Account</h2>
            <button onClick={async (event) => {
                event.preventDefault()
                setLoading(true)
                try {
                    const { id } = await createAccount()
                    const data = {
                        "refresh_url": `${window.location.origin}/accounts/${id}`,
                        "return_url": `${window.location.origin}/accounts/${id}`
                    }
                    const { url } = await getAccountOnboardingLink(id, data)
                    window.location.href = url;
                } catch {
                    return setLoading(false)
                }
            }} disabled={loading}>Get Started</button>
        </div>
    );
}

export default AccountOnboarding;