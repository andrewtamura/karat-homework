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
                const data = {
                    "refresh_url": `${window.location.origin}/account/${id}`,
                    "return_url": `${window.location.origin}/account/${id}`
                }
                const { url } = await getAccountOnboardingLink(id, data)
                window.href = url;
            }} disabled={loading}>Get Started</button>
        </div>
    );
}

export default AccountOnboarding;