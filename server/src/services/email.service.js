// src/services/email.service.js
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'AutoNexus <noreply@autonexus.com>';
const DEALER_EMAIL = process.env.DEALER_EMAIL || 'admin@autonexus.com';

const sendEmail = async ({ to, subject, html }) => {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL SKIPPED] No RESEND_API_KEY. Would send: "${subject}" to ${to}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });
    if (!res.ok) console.error('[EMAIL ERROR]', await res.json());
  } catch (err) { console.error('[EMAIL FAILED]', err.message); }
};

const base = (content) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:0}
.w{max-width:600px;margin:0 auto;padding:40px 20px}
.logo{font-size:22px;font-weight:900;letter-spacing:4px;color:#f97316;margin-bottom:32px}
.card{background:#111;border:1px solid #222;border-radius:16px;padding:32px}
.label{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.val{font-size:15px;color:#fff;margin-bottom:16px;font-weight:500}
.price{font-size:28px;font-weight:700;color:#f97316;margin:16px 0}
.btn{display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;margin-top:24px}
.hr{border:none;border-top:1px solid #222;margin:24px 0}
.foot{margin-top:32px;font-size:12px;color:#333;text-align:center}
</style></head><body><div class="w">
<div class="logo">AUTONEXUS</div>${content}
<div class="foot">© ${new Date().getFullYear()} AutoNexus · Nairobi, Kenya</div>
</div></body></html>`;

export const sendDealerOrderNotification = async ({ order, car, user }) => {
  const type = order.type === 'INQUIRY' ? 'Inquiry' : order.type === 'DEPOSIT' ? 'Deposit' : 'Purchase';
  await sendEmail({
    to: DEALER_EMAIL,
    subject: `🚗 New ${type} — ${car.year} ${car.make} ${car.model}`,
    html: base(`<div class="card">
      <h2 style="margin:0 0 24px">New ${type} Received</h2>
      <div class="label">Customer</div><div class="val">${user.name} · ${user.email}${user.phone ? ' · ' + user.phone : ''}</div>
      <div class="label">Vehicle</div><div class="val">${car.year} ${car.make} ${car.model}</div>
      <div class="label">Amount</div><div class="price">KES ${order.amount?.toLocaleString()}</div>
      <hr class="hr"/>
      <div class="label">Order ID</div><div class="val" style="font-size:12px;color:#555">${order.id}</div>
      <a href="${process.env.CLIENT_URL}/admin" class="btn">View in Admin Panel →</a>
    </div>`)
  });
};

export const sendCustomerOrderConfirmation = async ({ order, car, user }) => {
  const isInquiry = order.type === 'INQUIRY';
  await sendEmail({
    to: user.email,
    subject: isInquiry ? `✅ Inquiry received — ${car.year} ${car.make} ${car.model}` : `🎉 Deposit confirmed — ${car.year} ${car.make} ${car.model}`,
    html: base(`<div class="card">
      <h2 style="margin:0 0 8px">${isInquiry ? 'Your inquiry is in!' : 'Deposit confirmed!'}</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px">${isInquiry ? 'Our team will reach out within 24 hours.' : 'Your deposit is received. The vehicle is now reserved for you.'}</p>
      <div class="label">Vehicle</div><div class="val">${car.year} ${car.make} ${car.model}</div>
      <div class="label">${isInquiry ? 'Listed Price' : 'Deposit Paid'}</div><div class="price">KES ${order.amount?.toLocaleString()}</div>
      <hr class="hr"/>
      <p style="color:#555;font-size:13px">Questions? WhatsApp: <strong style="color:#fff">${process.env.DEALER_WHATSAPP || '+254 700 000 000'}</strong></p>
      <a href="${process.env.CLIENT_URL}/account" class="btn">View My Orders →</a>
    </div>`)
  });
};

export const sendWelcomeEmail = async ({ user }) => {
  await sendEmail({
    to: user.email,
    subject: '🚗 Welcome to AutoNexus!',
    html: base(`<div class="card">
      <h2 style="margin:0 0 8px">Welcome, ${user.name.split(' ')[0]}! 👋</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px">Your account is ready. Browse AI-powered inventory and find your perfect car.</p>
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="color:#f97316;font-size:13px;font-weight:600;margin:0 0 8px">✨ What you can do:</p>
        <ul style="color:#888;font-size:13px;line-height:1.8;margin:0;padding-left:16px">
          <li>Browse hundreds of verified vehicles</li>
          <li>Ask our AI for personalized recommendations</li>
          <li>Get AI price analysis on any car</li>
          <li>Save favourites and send inquiries</li>
        </ul>
      </div>
      <a href="${process.env.CLIENT_URL}/cars" class="btn">Start Browsing →</a>
    </div>`)
  });
};
