import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Premium Digital Products",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen py-20 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: June 19, 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Information We Collect */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us when you create
              an account, make a purchase, or contact our support team. This
              includes your name, email address, billing information, and any
              other details you choose to share. We also automatically collect
              certain technical data when you visit our platform, such as your
              IP address, browser type, device information, and browsing
              patterns through cookies and similar technologies.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information enables us to process transactions, deliver
              purchased digital products, and provide customer support. We use
              it to personalize your experience, recommend relevant products,
              and send important updates about your account or purchases. We may
              also use aggregated, anonymized data to analyze trends, improve
              our services, and develop new features. We will never sell your
              personal information to third parties for their marketing
              purposes.
            </p>
          </section>

          {/* Data Sharing */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Data Sharing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We share your information only when necessary to fulfill our
              services. This includes trusted payment processors to handle
              transactions, cloud hosting providers to store data securely, and
              analytics services to help us understand usage patterns. We may
              also disclose information when required by law, to protect our
              rights, or to prevent fraud. All third-party partners are
              contractually obligated to handle your data in accordance with
              applicable privacy regulations.
            </p>
          </section>

          {/* Cookies */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our platform uses cookies and similar tracking technologies to
              enhance your browsing experience. Essential cookies are required
              for core functionality such as authentication and cart management.
              Analytics cookies help us understand how visitors interact with
              our site so we can continually improve it. You can manage your
              cookie preferences through your browser settings at any time;
              however, disabling essential cookies may affect the functionality
              of certain features.
            </p>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your
              personal information from unauthorized access, alteration,
              disclosure, or destruction. All data transmitted between your
              browser and our servers is encrypted using TLS. Payment
              information is processed through PCI-DSS compliant providers and
              is never stored on our servers. While no method of transmission
              over the internet is completely secure, we are committed to
              maintaining the highest level of protection for your data.
            </p>
          </section>

          {/* Your Rights */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your jurisdiction, you may have the right to access,
              correct, or delete the personal information we hold about you. You
              can request a copy of your data, ask us to update inaccurate
              information, or request the erasure of your account and associated
              data. You also have the right to withdraw consent for data
              processing at any time and to lodge a complaint with your local
              data protection authority. We will respond to all legitimate
              requests within 30 days.
            </p>
          </section>

          {/* Contact Us */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please reach out to us at{" "}
              <a
                href="mailto:privacy@premiumdigitalproducts.com"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
              >
                privacy@premiumdigitalproducts.com
              </a>
              . You may also write to our Data Protection Officer at our
              registered business address. We take every inquiry seriously and
              will work to resolve any issues promptly.
            </p>
          </section>
        </div>

        {/* Footer accent line */}
        <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      </div>
    </main>
  );
}
