import { apiFetch } from '@/lib/api-client'
import { ShiftTemplate } from '../types'

export async function getShiftTemplates(
  wardId: string, 
  year: number, 
  month: number
): Promise<ShiftTemplate[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiMonth = month + 1;

  const params = new URLSearchParams({
    year: year.toString(),
    month: apiMonth.toString()
  });

  const url = `${baseUrl}/api/shift-template/getAllShiftTemplateInWard/${wardId}?${params.toString()}`;
  
  const response = await apiFetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลเวรได้');
  }

  const data = await response.json();
  
  console.log("DEBUG: Raw Data from API ->", data);

  return data;
}