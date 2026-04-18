import nodemailer from "nodemailer";

export async function sendOTPEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // This MUST be an "App Password", not your regular password
    },
  });

  const mailOptions = {
    from: `"PSS GO" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: "OTP สำหรับยืนยันการเปลี่ยนอีเมล - PSS GO",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-xl; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e293b; margin: 0;">PSS GO</h1>
          <p style="color: #64748b; font-size: 14px;">ระบบรักษาความปลอดภัยอัจฉริยะ</p>
        </div>
        <div style="background-color: #f8fafc; padding: 32px; border-radius: 16px; text-align: center;">
          <p style="color: #475569; margin-bottom: 8px; font-weight: bold;">รหัส OTP ของคุณคือ</p>
          <h2 style="font-size: 32px; color: #2563eb; letter-spacing: 0.5em; margin: 0; font-family: monospace;">${otp}</h2>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">(รหัสมีอายุการใช้งาน 10 นาที)</p>
        </div>
        <div style="margin-top: 24px; color: #64748b; font-size: 14px; line-height: 1.5;">
          <p>หากคุณไม่ได้ทำรายการเปลี่ยนอีเมล โปรดเพิกเฉยต่อข้อความนี้</p>
        </div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #cbd5e1; font-size: 11px;">
          <p>PSS GO &copy; Powered by PSS</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("ไม่สามารถส่งอีเมลได้ โปรดตรวจสอบการตั้งค่า SMTP");
  }
}
