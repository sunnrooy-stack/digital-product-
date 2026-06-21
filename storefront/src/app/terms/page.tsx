import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Premium Digital Products",
};

const sections = [
  {
    heading: "Acceptance of Terms",
    body: `By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue use of our services immediately. These terms apply to all visitors, users, and others who access or use our digital storefront. Your continued use of the platform following the posting of any changes constitutes acceptance of those changes.`,
  },
  {
    heading: "User Accounts",
    body: `When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of these Terms, which may result in immediate termination of your account. You are responsible for safeguarding the password you use to access our services and for any activities or actions under your password. You agree not to disclose your password to any third party and to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.`,
  },
  {
    heading: "Digital Products",
    body: `All digital products available on our platform are licensed, not sold. Upon completing a purchase, you are granted a non-exclusive, non-transferable, revocable license to access and use the digital product for personal or commercial use as specified in the product listing. You may not redistribute, resell, lease, license, sub-license, or offer the digital products to third parties unless expressly authorized. We reserve the right to modify, suspend, or discontinue any digital product at any time without prior notice.`,
  },
  {
    heading: "Payments & Refunds",
    body: `All payments are processed securely through our third-party payment providers. Prices for our digital products are subject to change without notice. We reserve the right to refuse or cancel any order at our sole discretion. Due to the nature of digital products, all sales are generally considered final. Refund requests may be considered on a case-by-case basis within 14 days of purchase if the product is found to be materially defective or substantially different from its description. To request a refund, please contact our support team with your order details.`,
  },
  {
    heading: "Intellectual Property",
    body: `All content available on our platform — including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software — is the property of Premium Digital Products or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws. The compilation of all content on this platform is the exclusive property of Premium Digital Products. You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the service or content without express written permission from us.`,
  },
  {
    heading: "Limitation of Liability",
    body: `In no event shall Premium Digital Products, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the service. Our total liability for any claim arising out of or relating to these terms or our services shall not exceed the amount you paid to us in the twelve months preceding the claim. This limitation of liability applies to the fullest extent permitted by applicable law.`,
  },
  {
    heading: "Changes to Terms",
    body: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our services after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the service and contact us to close your account.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen py-20 px-6 lg:px-8 bg-background text-foreground">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: June 19, 2026
          </p>
        </div>

        {/* Decorative gradient divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-white/[0.1]"
            >
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                {section.heading}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />
          <p className="text-sm text-muted-foreground">
            If you have any questions about these Terms &amp; Conditions, please
            contact us at{" "}
            <span className="text-white font-medium underline underline-offset-4 decoration-white/30">
              support@premiumdigital.com
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
