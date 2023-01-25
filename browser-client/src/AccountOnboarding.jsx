import { useState } from "react";
import { createAccount, getAccountOnboardingLink } from "./apiClient";

const AccountOnboarding = () => {
    const [loading, setLoading] = useState(false)
    return (
        <div>
            <h2>Create a new account</h2>
            <button onClick={async (event) => {
                event.preventDefault()
                setLoading(true)
                const { id } = await createAccount()
                const { url } = await getAccountOnboardingLink(id)
                window.href = url;
            }} disabled={loading}>Get Started</button>

        </div>
    );
}

export default AccountOnboarding;