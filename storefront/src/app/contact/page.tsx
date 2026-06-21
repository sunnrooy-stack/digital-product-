import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Premium Digital Products",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen max-w-5xl py-20 px-6 lg:px-8 mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
          Get in Touch
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Have a question, feedback, or partnership inquiry? We'd love to hear
          from you. Fill out the form and our team will get back to you within
          24&nbsp;hours.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Left: Contact Form ── */}
        <div className="glass-panel rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>

          <form className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                required
                className="bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className="text-sm font-medium text-muted-foreground">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What is this about?"
                required
                className="bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Tell us more…"
                required
                className="bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-primary py-3 text-white font-bold hover:opacity-90 transition-opacity mt-2"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* ── Right: Contact Info Cards ── */}
        <div className="flex flex-col gap-6">
          {/* Email Card */}
          <div className="glass-panel rounded-2xl p-6 flex items-start gap-4">
            <span className="text-3xl" aria-hidden="true">📧</span>
            <div>
              <h3 className="font-semibold text-lg">Email</h3>
              <p className="text-muted-foreground mt-1">support@premiumdigital.store</p>
              <p className="text-muted-foreground text-sm">We respond within 24 hours</p>
            </div>
          </div>

          {/* Phone Card */}
          <div className="glass-panel rounded-2xl p-6 flex items-start gap-4">
            <span className="text-3xl" aria-hidden="true">📞</span>
            <div>
              <h3 className="font-semibold text-lg">Phone</h3>
              <p className="text-muted-foreground mt-1">+1 (555) 123-4567</p>
              <p className="text-muted-foreground text-sm">Mon – Fri, 9 AM – 6 PM EST</p>
            </div>
          </div>

          {/* Location Card */}
          <div className="glass-panel rounded-2xl p-6 flex items-start gap-4">
            <span className="text-3xl" aria-hidden="true">📍</span>
            <div>
              <h3 className="font-semibold text-lg">Location</h3>
              <p className="text-muted-foreground mt-1">123 Digital Avenue, Suite 400</p>
              <p className="text-muted-foreground text-sm">San Francisco, CA 94107</p>
            </div>
          </div>

          {/* Decorative gradient block */}
          <div className="flex-1 min-h-[120px] rounded-2xl bg-gradient-to-br from-primary/20 via-purple-600/10 to-transparent border border-white/5 flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center px-6">
              🌐&nbsp; We serve customers worldwide with instant digital delivery.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
