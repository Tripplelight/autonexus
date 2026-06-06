// src/services/email.service.js
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'AutoNexus <noreply@autonexus.com>';
const DEALER_EMAIL = process.env.DEALER_EMAIL || 'admin@autonexus.com';
const CLIENT_URL = process.env.CLIENT_URL || 'https://autonexus-six.vercel.app';

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
.btn-outline{display:inline-block;background:transparent;color:#f97316;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;border:1px solid #f97316;margin-top:12px}
.hr{border:none;border-top:1px solid #222;margin:24px 0}
.foot{margin-top:32px;font-size:12px;color:#333;text-align:center}
.badge{display:inline-block;background:#f97316;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:1px}
.warn{background:#1a0f00;border:1px solid #f97316/30;border-radius:12px;padding:20px;margin:16px 0}
.danger{background:#1a0000;border:1px solid #ef444430;border-radius:12px;padding:20px;margin:16px 0}
</style></head><body><div class="w">
<div class="logo">AUTONEXUS</div>${content}
<div class="foot">© ${new Date().getFullYear()} AutoNexus · Nairobi, Kenya 🇰🇪</div>
</div></body></html>`;

// ── Order Notifications ───────────────────────────────────────────────────────
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
      <a href="${CLIENT_URL}/admin" class="btn">View in Admin Panel →</a>
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
      <p style="color:#666;font-size:14px;margin:0 0 24px">${isInquiry ? 'The dealer will reach out within 24 hours.' : 'Your deposit is received. The vehicle is now reserved for you.'}</p>
      <div class="label">Vehicle</div><div class="val">${car.year} ${car.make} ${car.model}</div>
      <div class="label">${isInquiry ? 'Listed Price' : 'Deposit Paid'}</div><div class="price">KES ${order.amount?.toLocaleString()}</div>
      <hr class="hr"/>
      <p style="color:#555;font-size:13px">Questions? WhatsApp: <strong style="color:#fff">${process.env.DEALER_WHATSAPP || '+254 700 000 000'}</strong></p>
      <a href="${CLIENT_URL}/account" class="btn">View My Orders →</a>
    </div>`)
  });
};

// ── Welcome Emails ────────────────────────────────────────────────────────────
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
      <a href="${CLIENT_URL}/cars" class="btn">Start Browsing →</a>
    </div>`)
  });
};

export const sendDealerWelcomeEmail = async ({ user, businessName }) => {
  await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to AutoNexus — Your dealership is live!',
    html: base(`<div class="card">
      <div class="badge">DEALER</div>
      <h2 style="margin:16px 0 8px">You're in, ${user.name.split(' ')[0]}! 🚗</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px"><strong style="color:#fff">${businessName}</strong> is now on AutoNexus. Your 30-day free trial starts today.</p>
      
      <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="color:#f97316;font-size:13px;font-weight:600;margin:0 0 12px">🚀 Get started in 3 steps:</p>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px">
          <div style="width:22px;height:22px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;shrink:0">1</div>
          <p style="color:#888;font-size:13px;margin:3px 0 0">Complete your business profile — logo, description, location</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px">
          <div style="width:22px;height:22px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">2</div>
          <p style="color:#888;font-size:13px;margin:3px 0 0">Add your first vehicle listing with photos</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:22px;height:22px;background:#f97316;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">3</div>
          <p style="color:#888;font-size:13px;margin:3px 0 0">Start receiving buyer inquiries directly to your dashboard</p>
        </div>
      </div>

      <p style="color:#555;font-size:12px">Trial ends in 30 days. After that, stay active for KES 5,000/month.</p>
      <a href="${CLIENT_URL}/dealer/onboarding" class="btn">Set Up My Dealership →</a>
    </div>`)
  });
};

// ── Subscription Renewal Reminders ───────────────────────────────────────────
export const sendSubscriptionRenewalReminder = async ({ dealer, daysLeft }) => {
  const isUrgent = daysLeft <= 3;
  const subject = isUrgent
    ? `⚠️ Your AutoNexus subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
    : `📅 Reminder: Your AutoNexus subscription expires in ${daysLeft} days`;

  await sendEmail({
    to: dealer.user.email,
    subject,
    html: base(`<div class="card">
      <h2 style="margin:0 0 8px">${isUrgent ? '⚠️ Urgent: ' : ''}Subscription expiring soon</h2>
      <p style="color:#666;font-size:14px;margin:0 0 20px">
        Hi ${dealer.user.name.split(' ')[0]}, your <strong style="color:#fff">${dealer.businessName}</strong> subscription expires in 
        <strong style="color:#f97316">${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong>.
      </p>

      <div class="${isUrgent ? 'danger' : 'warn'}">
        <p style="color:#f97316;font-size:13px;font-weight:600;margin:0 0 6px">
          ${isUrgent ? '🚨 Your listings will be hidden when your subscription expires' : '📋 What happens when it expires'}
        </p>
        <ul style="color:#888;font-size:13px;line-height:1.8;margin:0;padding-left:16px">
          <li>All your car listings will be hidden from buyers</li>
          <li>You won't receive new inquiries</li>
          <li>Your dealer dashboard remains accessible</li>
        </ul>
      </div>

      <p style="color:#555;font-size:13px;margin:16px 0 0">Renew now to keep your inventory visible 24/7.</p>
      <a href="${CLIENT_URL}/dealer/subscription" class="btn">Renew Now — KES 5,000/month →</a>
    </div>`)
  });
};

export const sendSubscriptionExpiredEmail = async ({ dealer }) => {
  await sendEmail({
    to: dealer.user.email,
    subject: '❌ Your AutoNexus subscription has expired',
    html: base(`<div class="card">
      <h2 style="margin:0 0 8px">Your subscription has expired</h2>
      <p style="color:#666;font-size:14px;margin:0 0 20px">
        Hi ${dealer.user.name.split(' ')[0]}, your <strong style="color:#fff">${dealer.businessName}</strong> subscription has expired and your listings are now hidden.
      </p>
      <div class="danger">
        <p style="color:#ef4444;font-size:13px;font-weight:600;margin:0 0 4px">Listings hidden</p>
        <p style="color:#888;font-size:13px;margin:0">Buyers can no longer see your vehicles on AutoNexus.</p>
      </div>
      <p style="color:#555;font-size:13px;margin:16px 0 0">Renew your subscription to go live again immediately.</p>
      <a href="${CLIENT_URL}/dealer/subscription" class="btn">Reactivate Now →</a>
    </div>`)
  });
};

// ── Subscription Confirmed ────────────────────────────────────────────────────
export const sendSubscriptionConfirmedEmail = async ({ dealer, months, endsAt }) => {
  await sendEmail({
    to: dealer.user.email,
    subject: '✅ Subscription activated — Your listings are live!',
    html: base(`<div class="card">
      <h2 style="margin:0 0 8px">You're all set! 🎉</h2>
      <p style="color:#666;font-size:14px;margin:0 0 24px">
        Hi ${dealer.user.name.split(' ')[0]}, your <strong style="color:#fff">${dealer.businessName}</strong> subscription is now active.
      </p>
      <div class="label">Plan</div><div class="val">${months}-Month Subscription</div>
      <div class="label">Active Until</div><div class="val">${new Date(endsAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="label">Amount Paid</div><div class="price">KES ${(5000 * months).toLocaleString()}</div>
      <hr class="hr"/>
      <p style="color:#555;font-size:13px">All your listings are now visible to buyers on AutoNexus.</p>
      <a href="${CLIENT_URL}/dealer/dashboard" class="btn">Go to Dashboard →</a>
    </div>`)
  });
};