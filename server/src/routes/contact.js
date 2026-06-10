// src/routes/contact.js
import { Router } from 'express';
import { sendEmail } from '../services/email.service.js';

const router = Router();

const DEALER_EMAIL = process.env.DEALER_EMAIL || 'admin@autonexus.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'AutoNexus <noreply@autonexus.com>';

router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await sendEmail({
      to: DEALER_EMAIL,
      subject: `📩 Contact Form: ${subject}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body{font-family:sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:0}
        .w{max-width:600px;margin:0 auto;padding:40px 20px}
        .logo{font-size:22px;font-weight:900;letter-spacing:4px;color:#f97316;margin-bottom:32px}
        .card{background:#111;border:1px solid #222;border-radius:16px;padding:32px}
        .label{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
        .val{font-size:15px;color:#fff;margin-bottom:16px;font-weight:500}
        .msg{background:#1a1a1a;border-radius:12px;padding:20px;color:#ccc;font-size:14px;line-height:1.7}
        .foot{margin-top:32px;font-size:12px;color:#333;text-align:center}
      </style></head><body><div class="w">
        <div class="logo">AUTONEXUS</div>
        <div class="card">
          <h2 style="margin:0 0 24px">New Contact Form Submission</h2>
          <div class="label">Name</div><div class="val">${name}</div>
          <div class="label">Email</div><div class="val">${email}</div>
          <div class="label">Subject</div><div class="val">${subject}</div>
          <div class="label">Message</div>
          <div class="msg">${message.replace(/\n/g, '<br/>')}</div>
        </div>
        <div class="foot">© ${new Date().getFullYear()} AutoNexus · Nairobi, Kenya 🇰🇪</div>
      </div></body></html>`
    });

    // Auto-reply to sender
    await sendEmail({
      to: email,
      subject: `✅ We received your message — AutoNexus`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body{font-family:sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:0}
        .w{max-width:600px;margin:0 auto;padding:40px 20px}
        .logo{font-size:22px;font-weight:900;letter-spacing:4px;color:#f97316;margin-bottom:32px}
        .card{background:#111;border:1px solid #222;border-radius:16px;padding:32px}
        .foot{margin-top:32px;font-size:12px;color:#333;text-align:center}
      </style></head><body><div class="w">
        <div class="logo">AUTONEXUS</div>
        <div class="card">
          <h2 style="margin:0 0 8px">Got your message, ${name.split(' ')[0]}! 👋</h2>
          <p style="color:#666;font-size:14px;margin:0 0 16px">Thanks for reaching out. We'll get back to you within 24 hours.</p>
          <p style="color:#555;font-size:13px">— The AutoNexus Team</p>
        </div>
        <div class="foot">© ${new Date().getFullYear()} AutoNexus · Nairobi, Kenya 🇰🇪</div>
      </div></body></html>`
    });

    res.json({ message: 'Message sent successfully.' });
  } catch (err) { next(err); }
});

export default router;