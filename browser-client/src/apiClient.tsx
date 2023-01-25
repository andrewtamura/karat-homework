export interface StripeAccount {
    id: string;
    company: {
        name: string
    },
    future_requirements: {
        currently_due: string[]
    }
}

export interface StripeAccountLink {
    url: string;
}

export interface CreateStripeAccountLink extends Record<string, string> {
    return_url: string;
    refresh_url: string;
}

export interface StripeCardholder {
    name: string;
    email: string;
    phone_number: string;
    type: string;
    billing: {
        address: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        }
    }
}

export interface StripeCard {
    id: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    last4: string;
    status: string;
}

export interface Account {
    id: string;
    data: StripeAccount;
    cards: Card[];
    cardholders: Cardholder[];
}

export interface Card {
    id: string;
    data: StripeCard
}

export interface Cardholder {
    id: string;
    data: StripeCardholder
}

const API_ROOT = "/api"
const http = (path: string, ctx?: Record<string, any>) => {
    return fetch(path, {
        headers: {'Content-Type': 'application/json'},
        ...ctx
    })
}
export const getAccounts = async (): Promise<Account[]> => {
    const resp = await fetch(`${API_ROOT}/accounts/`)
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const getAccount = async (accountId: string): Promise<Account> => {
    const resp = await http(`${API_ROOT}/accounts/${accountId}/`)
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const createAccount = async (): Promise<Account> => {
    const resp = await http(`${API_ROOT}/accounts/`, { method: "POST" })
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const getAccountOnboardingLink = async (accountId: string, data: CreateStripeAccountLink): Promise<StripeAccountLink> => {
    const queryParams = new URLSearchParams(data)
    const resp = await http(`${API_ROOT}/accounts/${accountId}/onboarding-link/?${queryParams}`)
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const getAccountUpdateLink = async (accountId: string, data: CreateStripeAccountLink): Promise<StripeAccountLink> => {
    const queryParams = new URLSearchParams(data)
    const resp = await http(`${API_ROOT}/accounts/${accountId}/update-link/?${queryParams}`)
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const getCardholders = async (accountId: string): Promise<Cardholder[]> => {
    const resp = await http(`${API_ROOT}/accounts/${accountId}/cardholders/`)
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const createCardholder = async (accountId: string, data: StripeCardholder): Promise<Cardholder[]> => {
    const resp = await http(`${API_ROOT}/accounts/${accountId}/cardholders/`, { method: "POST", body: JSON.stringify(data) })
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const getCards = async (accountId: string): Promise<Card[]> => {
    const resp = await http(`${API_ROOT}/accounts/${accountId}/cards`)
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}
export const createCard = async (accountId: string, data: StripeCard): Promise<Card[]> => {
    const resp = await http(`${API_ROOT}/accounts/${accountId}/cards/`, { method: "POST", body: JSON.stringify(data) })
    if (!resp.ok) {
        throw new Error(resp.statusText)
    }
    return await resp.json()
}