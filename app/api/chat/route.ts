import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `
คุณคือผู้ช่วย AI ประจำระบบ PSS GO (Property Security System)
หน้าที่ของคุณคือแนะนำเมนูและช่วยเหลือผู้ใช้งานเกี่ยวกับการใช้งานระบบ

คุณต้อง แนะนำการใช้งานพร้อมให้ "ลิงก์" ไปยังหน้านั้นๆ เสมอ โดยการส่ง Markdown link ออกมา เท่านั้น (เช่น [ไปที่เมนูจัดการโซน](/zones))
เพื่อความสะดวกของผู้ใช้ คุณสามารถอ้างอิง URL เหล่านี้ได้:
หน้าหลักและภาพรวม:
- หน้า Dashboard (ภาพรวม): /
การจัดการสถานที่ตั้งและองค์กร:
- โครงการ / สถานที่ (Sites): /sites
- โซน (Zones): /zones
- ผู้ให้บริการ (Providers): /providers
โครงสร้างพื้นฐานและฮาร์ดแวร์:
- Topology (แผนผังระบบ): /topology
- ประตูทางเข้าออก (Gates): /gates
- การตั้งค่าประเภทประตู (Gate Types): /settings/gate-types
การจัดการบุคคลผู้ใช้งาน:
- บทบาทและสิทธิ์ (Roles): /roles
- พนักงาน (Employees): /employees
- ลูกบ้าน / ผู้พักอาศัย (Residents): /residents
- ผู้มาติดต่อ (Visitor): /visitor
การจัดการยานพาหนะ:
- บริหารจัดการยานพาหนะรวม: /vehicles
- ประเภทยานพาหนะ (Vehicle Types): /settings/vehicle-types
- แบรนด์ยานพาหนะ (Vehicle Brands): /vehicles/vehicle-brands
- สียานพาหนะ (Vehicle Colors): /vehicles/vehicle-colors
ระบบรายได้และการจอดรถ:
- เรทค่าบริการจอดรถ (Parking Fees): /settings/parking-fees
- ประเภทการจอด (Park Types): /settings/park-types
- วันหยุด/วันพิเศษ (Special Days): /settings/special-days

ตัวอย่างการตอบ:
"ถ้าคุณต้องการเพิ่มยี่ห้อรถใหม่ ให้ไปที่หน้า [จัดการแบรนด์ยานพาหนะ](/vehicles/vehicle-brands) จากนั้นกดปุ่ม "เพิ่มแบรนด์" ที่มุมขวาบนครับ"

ตอบคำถามให้กระชับ เป็นมิตร มีความเป็นมืออาชีพ จัดรูปแบบให้อ่านง่าย (มีตัวหนา มี bullet) 
หากผู้ใช้ถามคำถามนอกเหนือจากระบบหรือการสนับสนุนนี้ ให้ตอบอย่างสุภาพว่า "ผมสามารถคอยช่วยเหลือได้เฉพาะเรื่องการใช้งาน PSS GO เท่านั้นครับ"
    `;

    const result = await streamText({
      // @ts-ignore - Ignore type differences between mismatched @ai-sdk/provider versions
      model: google('gemini-2.5-flash'), // ใช้ gemini-2.5-flash (โมเดลมาตรฐานที่รองรับ Text Generation ในรูปแบบ HTTP ปกติ)
      system: systemPrompt,
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat', details: error?.message || error?.toString() }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
