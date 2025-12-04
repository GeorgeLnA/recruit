import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-peach)]">
      <div className="mx-auto" style={{ maxWidth: '1400px', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)', paddingTop: 'clamp(120px, 12vw, 192px)', paddingBottom: 'clamp(80px, 8vw, 128px)' }}>
        <h1 className="font-bold text-center" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(40px, 4vw, 56px)', marginBottom: 'clamp(40px, 4vw, 48px)' }}>
          Privacy Policy
        </h1>
        
        <div className="max-w-none" style={{ color: 'var(--color-white)' }}>
          <p style={{ opacity: 0.9, fontSize: 'clamp(14px, 1.125vw, 18px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              1. Introduction
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              CDC Global Solutions ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              2. Information We Collect
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We may collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc" style={{ opacity: 0.9, paddingLeft: 'clamp(20px, 1.5vw, 24px)', marginBottom: 'clamp(12px, 1vw, 16px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              <li>Name and contact information (email address, phone number, postal address)</li>
              <li>Professional information (CV, work history, qualifications)</li>
              <li>Company information (for client inquiries)</li>
              <li>Any other information you choose to provide when contacting us</li>
            </ul>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We also automatically collect certain information when you visit our website, such as your IP address, browser type, and pages visited.
            </p>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              3. How We Use Your Information
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We use the information we collect to:
            </p>
            <ul className="list-disc" style={{ opacity: 0.9, paddingLeft: 'clamp(20px, 1.5vw, 24px)', marginBottom: 'clamp(12px, 1vw, 16px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              <li>Provide, maintain, and improve our recruitment services</li>
              <li>Match candidates with suitable job opportunities</li>
              <li>Connect clients with qualified candidates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you updates about our services (with your consent)</li>
              <li>Analyze website usage and improve user experience</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              4. Information Sharing and Disclosure
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc" style={{ opacity: 0.9, paddingLeft: 'clamp(20px, 1.5vw, 24px)', marginBottom: 'clamp(12px, 1vw, 16px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              <li>With potential employers or clients (for candidates) or with candidates (for clients), as part of our recruitment services</li>
              <li>With service providers who assist us in operating our website and conducting our business</li>
              <li>When required by law or to protect our rights and safety</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              5. Data Security
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              6. Your Rights
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              You have the right to:
            </p>
            <ul className="list-disc" style={{ opacity: 0.9, paddingLeft: 'clamp(20px, 1.5vw, 24px)', marginBottom: 'clamp(12px, 1vw, 16px)', display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              <li>Access and receive a copy of your personal information</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              7. Data Retention
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              8. Contact Us
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
            </p>
            <div className="bg-[var(--color-blue)] rounded-lg" style={{ opacity: 0.95, padding: 'clamp(20px, 1.5vw, 24px)', marginBottom: 'clamp(12px, 1vw, 16px)' }}>
              <p style={{ color: 'var(--color-white)', marginBottom: 'clamp(8px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
                <strong>Email:</strong> harriet@cdcglobal.co.uk or adam@cdcglobal.co.uk
              </p>
              <p style={{ color: 'var(--color-white)', marginBottom: 'clamp(8px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
                <strong>Phone:</strong> 07554 440 299
              </p>
              <p style={{ color: 'var(--color-white)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
                <strong>Address:</strong> Meydan Grandstand, 6th Floor, Meydan Road, Nad Al Sheba, Dubai, U.A.E.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: 'clamp(40px, 4vw, 48px)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-white)', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              9. Changes to This Privacy Policy
            </h2>
            <p style={{ opacity: 0.9, marginBottom: 'clamp(12px, 1vw, 16px)', lineHeight: '1.6', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

