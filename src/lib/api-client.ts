const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(
  input: RequestInfo,
  init?: RequestInit
) {
  const isBrowser = typeof window !== "undefined"

  // 🚩 1. ดึง Token และจัดการ "ล้าง" (คงเดิมตามอันเก่าที่คุณใช้)
  const rawToken = isBrowser ? localStorage.getItem("accessToken") : null
  const token = rawToken ? rawToken.replace(/"/g, "").trim() : null

  const headers = new Headers(init?.headers)

  // 🚩 2. ใส่ Content-Type เฉพาะตอนมี body
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }

  // 🚩 3. ตรวจสอบ Token ก่อนส่ง (คงเดิมตามอันเก่า)
  if (token && token !== "undefined" && token !== "null") {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // 🚩 4. ตรวจสอบ Environment (คงเดิมตามอันเก่า - กันเหนียวเรื่อง Google Auth)
  if (!API_BASE_URL && typeof input === "string" && !input.startsWith("http")) {
    throw new Error("API_BASE_URL is not defined in environment variables")
  }

  const url =
    typeof input === "string"
      ? input.startsWith("http")
        ? input
        : `${API_BASE_URL}${input}`
      : input

  // 👇 DEBUG LOG (เก็บไว้ดูว่า Google Auth พ่นอะไรออกมา)
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
        localStorage.removeItem("accessToken")
      }
      throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่")
    }

    // 🚩 6. จัดการ Error (400, 500) และดึงข้อมูล Warning/Error ก้อนใหญ่มาใช้
    if (!res.ok) {
      const errorText = await res.text()
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      // 🚩 หัวใจสำคัญ: เก็บก้อน errorData ทั้งก้อนลงใน error object
      const error: any = new Error(errorData.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ")
      error.status = res.status
      error.data = errorData // 👈 ห้ามลบบรรทัดนี้ เพราะเราต้องใช้ warning ในหน้าเซฟ
      
      throw error
    }

    return res // 200 OK
  } catch (error: any) {
    console.error("Fetch Error:", error.message)
    throw error
  }
}