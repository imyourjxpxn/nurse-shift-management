const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const isBrowser = typeof window !== "undefined"
  const rawToken = isBrowser ? localStorage.getItem("accessToken") : null
  const token = rawToken ? rawToken.replace(/"/g, "").trim() : null

  const headers = new Headers(init?.headers)
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }
  if (token && token !== "undefined" && token !== "null") {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const url = typeof input === "string" 
    ? (input.startsWith("http") ? input : `${API_BASE_URL}${input}`) 
    : input

  try {
    const res = await fetch(url, { ...init, headers })

    if (res.status === 401) {
      if (isBrowser) localStorage.removeItem("accessToken")
      throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่")
    }

    // 🚩 ส่วนที่แก้ไข: จัดการ Error 400/500 ให้รองรับ details
    if (!res.ok) {
      const errorText = await res.text()
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      console.log("🔍 [apiFetch] Error Data from Server:", errorData)

      // สร้าง Error Object มาตรฐาน
      const error: any = new Error(errorData.message || "เกิดข้อผิดพลาด")
      error.status = res.status
      
      /** * 🚩 จุดสำคัญ: 
       * เก็บข้อมูลรายละเอียดความผิดพลาดไว้ใน .details 
       * โดยพยายามดึงจาก errorData.details (ตาม Backend ของคุณ) 
       * ถ้าไม่มีให้ลองหาจาก errorData.data หรือ errorData.errors
       */
      error.details = errorData.details || errorData.data || errorData.errors || [];
      
      // เก็บก้อนเต็มไว้ใน .data (เผื่อ Code ส่วนอื่นยังเรียกใช้ .data อยู่)
      error.data = errorData; 
      
      // เก็บ Error Code (เช่น EXCEED_MAX_CONTINUOUS_WORK_HOUR)
      error.code = errorData.code || (errorData.errors && errorData.errors[0]?.code);
      
      throw error
    }

    return res 
  } catch (error: any) {
    // 🚩 แก้ตรงนี้: เปลี่ยนจาก console.error เป็น console.warn
    if (error.status) {
      console.warn(`⚠️ [apiFetch] Server Error ${error.status}:`, error.message)
    } else {
      console.error("❌ [apiFetch] Network/Runtime Error:", error.message)
    }
    throw error // พ่นต่อเพื่อให้ useSaveConfig รับไปโชว์ใน Sidebar
  }
}