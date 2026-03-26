import { apiFetch } from "@/lib/api-client" // เช็ค path ให้ชัวร์นะครับ (ปกติจะเป็น @/lib/...)
import { User, CompleteRegistrationPayload } from "../../user/types"

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
  try {
    const res = await apiFetch(`${API_URL}/api/auth/me`)
    
    if (!res.ok) return null
    
    const data = await res.json()

    return {
      userId: data.userId,
      email: data.personalEmail || data.email,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      hospitalId: data.hospitalId,
      profileCompleted: data.profileCompleted,
    }
  } catch (error) {
    console.error("GetCurrentUser failed:", error)
    return null
  }
}

export const completeRegistration = async (payload: CompleteRegistrationPayload): Promise<User> => {
  const res = await apiFetch(`${API_URL}/api/user/updateForCompleteProfile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'ลงทะเบียนไม่สำเร็จ')
  }

  return res.json()
}

export const logout = () => 
  apiFetch(`${API_URL}/api/auth/logout`, { method: "POST" })
    .finally(() => {
      localStorage.removeItem("accessToken")
      clearPersistedUser()
    })

// 3. Storage Helpers
export const persistUser = (u: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(u))
  }
}

export const clearPersistedUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}