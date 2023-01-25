export interface StripeAccount {
    id: string;
    data: {
        name: string
    }
}

export interface StripeAccountLink {
    url: string;
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
    data: StripeAccount
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
export const getAccounts = async (): Promise<Account[]> => {
    const resp = await fetch(`${API_ROOT}/accounts`)
    return await resp.json()
}
export const getAccount = async (accountId: string): Promise<Account> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}`)
    return await resp.json()
}
export const createAccount = async (): Promise<Account> => {
    const resp = await fetch(`${API_ROOT}/accounts/`, {method: "POST"})
    return await resp.json()
}
export const getAccountOnboardingLink = async (accountId: string): Promise<StripeAccountLink> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}/onboarding-link/`)
    return await resp.json()
}
export const getAccountUpdateLink = async (accountId: string): Promise<StripeAccountLink> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}/update-link/`)
    return await resp.json()
}
export const getCardholders = async (accountId: string): Promise<Cardholder[]> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}/cardholders/`)
    return await resp.json()
}
export const createCardholders = async (accountId: string, data: StripeCardholder): Promise<Cardholder[]> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}/cardholders/`, {method: "POST", body: JSON.stringify(data)})
    return await resp.json()
}
export const getCards = async (accountId: string): Promise<Card[]> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}/cards`)
    return await resp.json()
}
export const createCards = async (accountId: string, data: StripeCard): Promise<Card[]> => {
    const resp = await fetch(`${API_ROOT}/accounts/${accountId}/cards/`, {method: "POST", body: JSON.stringify(data)})
    return await resp.json()
}