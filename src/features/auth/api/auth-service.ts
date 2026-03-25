import { apiFetch } from "src/lib/api-client"
import { User, CompleteRegistrationPayload } from "../types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// 1. Google OAuth
export const loginWithGoogle = () => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: `${API_URL}/api/auth/google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// 2. User Actions
export const getCurrentUser = async (): Promise<User | null> => {
  const res = await apiFetch(`${API_URL}/api/auth/me`).catch(() => null)
  if (!res?.ok) return null
  const data = await res.json()
  return {
    userId: data.userId,
    email: data.personalEmail,
    displayName: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
    hospitalId: data.hospitalId,
    profileCompleted: data.profileCompleted,
  }
}

export const completeRegistration = async (payload: CompleteRegistrationPayload): Promise<User> => {
  const res = await apiFetch('/api/user/updateForCompleteProfile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return res.json()
}

export const logout = () => 
  apiFetch(`${API_URL}/api/auth/logout`, { method: "POST" })
    .finally(() => localStorage.removeItem("accessToken"))

// 3. Storage Helpers
export const persistUser = (u: User) => localStorage.setItem('user', JSON.stringify(u))
export const clearPersistedUser = () => localStorage.removeItem('user')