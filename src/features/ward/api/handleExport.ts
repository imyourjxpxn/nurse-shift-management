import { apiFetch } from '@/lib/api-client';

export async function handleExport(
    wardId: string,
    year: number,
    month: number,
) {
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiMonth = month + 1; // ปรับให้ตรงกับ Logic เดือนของ API

    // จัดการ Query Parameters
    const params = new URLSearchParams({
        year: year.toString(),
        month: apiMonth.toString()
    });

    try {
        const res = await apiFetch(
            `${baseUrl}/api/report/export/${wardId}?${params.toString()}`,
            {
                method: 'POST',
            }
        );

        if (!res.ok) {
        throw new Error('Export failed');
        }

        // แปลงเป็น blob (ไฟล์)
        const blob = await res.blob();

        // สร้าง URL สำหรับดาวน์โหลด
        const url = window.URL.createObjectURL(blob);

        // สร้าง <a> เพื่อ trigger download
        const a = document.createElement('a');
        a.href = url;

        // ตั้งชื่อไฟล์ (แล้วแต่ backend จะส่ง header หรือเราตั้งเอง)
        a.download = `schedule-${year}-${month + 1}.xlsx`;

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        alert('Export ไม่สำเร็จ');
    }
};