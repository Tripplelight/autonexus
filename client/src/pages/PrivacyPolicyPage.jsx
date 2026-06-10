// src/pages/PrivacyPolicyPage.jsx
import { useSEO } from '../hooks/useSEO';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-semibold text-lg mb-3 text-white">{title}</h2>
    <div className="text-white/50 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  useSEO({ title: 'Privacy Policy', description: 'AutoNexus Privacy Policy' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <h1 className="font-display text-4xl tracking-wider mb-3">PRIVACY POLICY</h1>
        <p className="text-white/30 text-sm">Last updated: January 2025</p>
      </div>

      <div className="card p-8">
        <Section title="1. Information We Collect">
          <p>When you create an account, we collect your name, email address, and phone number. Dealers also provide business details including business name, location, and bank account information for payment purposes.</p>
          <p>When you browse or search for cars, we may collect usage data such as search terms, filters applied, and cars viewed to improve your experience.</p>
          <p>When you make a deposit or reservation, we collect transaction details including bank transfer references and M-Pesa transaction IDs.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your information to operate and improve AutoNexus, including processing orders, sending notifications, and providing customer support.</p>
          <p>We use your email to send transactional emails such as order confirmations, inquiry notifications, and subscription reminders. You may receive occasional platform updates.</p>
          <p>We do not sell your personal data to third parties.</p>
        </Section>

        <Section title="3. M-Pesa & Payment Data">
          <p>AutoNexus integrates with Safaricom's M-Pesa Daraja API for dealer subscription payments. When you initiate an M-Pesa payment, your phone number is shared with Safaricom to process the STK push request.</p>
          <p>We store transaction IDs and payment status for subscription management. We do not store your M-Pesa PIN or full payment credentials.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>When you send an inquiry or make a deposit on a vehicle, your name, email, and phone number are shared with the relevant dealer so they can follow up with you.</p>
          <p>We use the following third-party services: Cloudinary (image storage), Resend (email delivery), Render (server hosting), and Vercel (frontend hosting). Each operates under their own privacy policies.</p>
        </Section>

        <Section title="5. Data Security">
          <p>Passwords are hashed using bcrypt and never stored in plain text. All API communication is encrypted via HTTPS. We use JWT tokens for authentication, which expire after 7 days.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at admin@autonexus.com. We will respond within 7 business days.</p>
          <p>You may delete your account at any time through your account settings.</p>
        </Section>

        <Section title="7. Cookies">
          <p>AutoNexus does not use tracking cookies. We use browser localStorage to maintain your login session and preferences.</p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>We may update this policy from time to time. Significant changes will be communicated via email. Continued use of AutoNexus after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="9. Contact">
          <p>For privacy-related queries, contact us at: <strong className="text-white">admin@autonexus.com</strong></p>
        </Section>
      </div>
    </div>
  );
}