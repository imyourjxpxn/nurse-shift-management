const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const isBrowser = typeof window !== "undefined"

  // 🚩 1. ดึง Token และจัดการ "ล้าง" เครื่องหมายคำพูด (") และช่องว่าง (Space)
  const rawToken = isBrowser ? localStorage.getItem("accessToken") : null
  const token = rawToken ? rawToken.replace(/"/g, "").trim() : null

  const headers = new Headers(init?.headers)

  // 🚩 2. ใส่ Content-Type เฉพาะตอนมี body (และยังไม่มีการ set มาก่อน)
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }

  // 🚩 3. ตรวจสอบ Token ว่าไม่ใช่ String "null" หรือ "undefined" ก่อนส่ง
  if (token && token !== "undefined" && token !== "null") {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // 🚩 4. จัดการเรื่อง URL (Base URL)
  if (!API_BASE_URL && typeof input === "string" && !input.startsWith("http")) {
    throw new Error("API_BASE_URL is not defined in environment variables")
  }

  const url =
    typeof input === "string"
      ? input.startsWith("http")
        ? input
        : `${API_BASE_URL}${input}`
      : input

  // 👇 DEBUG LOG (เอาไว้เช็คตอนมีปัญหา)
  console.log("===== API DEBUG =====")
  console.log("Final URL:", url)
  console.log("Token Status:", token ? "Token Found & Cleaned" : "No Token")
  
  try {
    const res = await fetch(url, {
      ...init,
      headers,
    })

    // 🚩 5. จัดการกรณี Unauthorized (401)
    if (res.status === 401) {
      if (isBrowser) {
        // ลบ Token ที่อาจจะหมดอายุหรือพังทิ้ง
        localStorage.removeItem("accessToken")
        // เลือกได้ว่าจะให้เด้งไปหน้า login เลยไหม:
        // window.location.href = '/login'
      }
      throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่")
    }

    // 🚩 6. จัดการ Error อื่นๆ จาก Server
    if (!res.ok) {
      const errorText = await res.text()
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    return res
  } catch (error: any) {
    console.error("Fetch Error:", error.message)
    throw error
  }
}