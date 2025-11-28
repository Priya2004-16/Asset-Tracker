require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail(to, subject, message) {
  try {
    await resend.emails.send({
      from: "Lab Asset Tracker <onboarding@resend.dev>",  
      to: to,
      subject: subject,
      text: message,
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email Error:", error);
  }
}

module.exports = sendMail;
