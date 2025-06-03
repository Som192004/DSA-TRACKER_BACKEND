// routes/contactRoute.js
import express from "express";
import nodemailer from "nodemailer";
import Feedback from "../models/feedback.model.js";

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // 1. Save to DB
    await Feedback.create({ name, email, subject, message });

    // 2. Send email to user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // replace with your Gmail
        pass: process.env.GMAIL_PASS    // replace with your App Password
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Thank You for Your Feedback – DSA Tracker Team`,
      html: `
        <p>Hi <strong>${name}</strong>,</p>

        <p>Thank you for reaching out to <strong>DSA Tracker</strong>! 🎯</p>

        <p>We truly appreciate your feedback and the time you took to share your thoughts with us.</p>

        <p><strong>Your Message:</strong></p>
        <blockquote style="background-color:#f9f9f9;padding:10px;border-left:4px solid #ccc;">
          ${message}
        </blockquote>

        <p>As a platform dedicated to helping students prepare for placements through core subjects and DSA, your input plays a crucial role in improving the learning experience for all users.</p>

        <p>Our team has received your message and will review it promptly. If needed, we’ll get back to you shortly.</p>

        <p>Keep learning, keep growing — your dream job is just a few steps away!</p>

        <p>Best regards,<br/>
        The DSA Tracker Team 🚀</p>

        <hr/>
        <p style="font-size:0.8em;color:gray;">
          If you did not send this message, please ignore this email.
        </p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Feedback saved and email sent" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

export default router;
