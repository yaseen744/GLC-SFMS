import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail", // change this if you use a different provider (see README)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

export async function sendOtpEmail(toEmail, otp) {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 5;
  const fromName = process.env.EMAIL_FROM_NAME || "Global Learning Center";

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f5f6fb; padding:32px;">
    <div style="max-width:420px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(15,23,42,0.08);">
      <div style="background:linear-gradient(135deg,#312e81,#4338ca,#6366f1); padding:24px 28px;">
        <div style="color:#fff; font-size:18px; font-weight:700;">${fromName}</div>
        <div style="color:rgba(255,255,255,0.75); font-size:12px; margin-top:2px;">Student Management System</div>
      </div>
      <div style="padding:28px;">
        <p style="font-size:14px; color:#334155; margin:0 0 16px;">Use the code below to complete your admin sign-in:</p>
        <div style="text-align:center; margin:20px 0;">
          <span style="display:inline-block; font-size:32px; font-weight:800; letter-spacing:8px; color:#312e81; background:#eef2ff; padding:14px 22px; border-radius:12px;">${otp}</span>
        </div>
        <p style="font-size:13px; color:#64748b; margin:0;">This code expires in <b>${expiryMinutes} minutes</b>. Do not share it with anyone.</p>
        <p style="font-size:12px; color:#94a3b8; margin:18px 0 0;">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  </div>`;

  await getTransporter().sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your sign-in code: ${otp}`,
    html,
  });
}
