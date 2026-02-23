import { apiFetch } from "@/lib/api-client"

/* ============================= */
/* Types */
/* ============================= */

export interface User {
  id: string
  email: string
  displayName: string
  hospitalId: string
  profileCompleted: boolean
}

const USER_STORAGE_KEY = 'user'

/* ============================= */
/* Wait for Google SDK */
/* ============================= */

export async function extractGoogleAuth() {
  const params = new URLSearchParams(window.location.search)

  const token = params.get("accessToken")
  const complete = params.get("profileCompleted") // ✅ แก้ตรงนี้

  if (!token) {
    return null
  }

  localStorage.setItem("accessToken", token)

  return {
    profileCompleted: complete === "true",
  }
}

/* ============================= */
/* Google Login */
/* ============================= */

export function loginWithGoogle() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google` 

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  })

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}


export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`
    )

    if (!res.ok) return null

    const data = await res.json()

    return {
      id: data.userId,
      email: data.personalEmail,
      displayName: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
      hospitalId: data.hospitalId,
      profileCompleted: data.profileCompleted,
    }

  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}

/* ============================= */
/* Complete Registration */
/* ============================= */

export interface CompleteRegistrationPayload {
  userId: string
  firstName: string
  lastName: string
  //lineUserId: string | null
  //mobilePhone: string
  hospitalId: string
}

export async function completeRegistration(
  payload: CompleteRegistrationPayload
): Promise<User> {

  const res = await apiFetch(
    '/api/user/updateForCompleteProfile',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )

  const data = await res.json()

  return {
    id: data.userId,
    email: data.personalEmail ?? data.email ?? '',
    displayName: [data.firstName, data.lastName]
      .filter(Boolean)
      .join(' '),
    hospitalId: data.hospitalId,
    profileCompleted: data.profileCompleted ?? true,
  }
}

/* ============================= */
/* Update Display Name */
/* ============================= */

export async function updateDisplayName(
  user: User,
  newName: string,
): Promise<User> {

  const res = await apiFetch(
    `/users/${user.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ displayName: newName }),
    }
  )

  if (!res.ok) {
    throw new Error('Failed to update display name')
  }

  const data = await res.json()
  return data.user
}

/* ============================= */
/* Logout */
/* ============================= */

export async function logout(): Promise<void> {
  try {
    await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
      { method: "POST" }
    )
  } catch (error) {
    console.error("Logout API failed:", error)
  }

  // ลบฝั่ง client เสมอ
  localStorage.removeItem("accessToken")
  clearPersistedUser()
}

/* ============================= */
/* Local Storage */
/* ============================= */

export function persistUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function getPersistedUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  } catch {
    return null
  }
}

export function clearPersistedUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_STORAGE_KEY)
}