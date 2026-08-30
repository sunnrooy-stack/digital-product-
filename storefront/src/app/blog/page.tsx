import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Premium Digital Products",
};

const posts = [
  {
    title: "The Future of Digital Design Systems",
    excerpt:
      "Explore how modern design systems are transforming the way teams build products at scale, from tokens to components.",
    category: "Design",
    date: "Jun 15, 2026",
    readTime: "8 min read",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    title: "Mastering Color Theory for UI",
    excerpt:
      "A deep dive into color palettes, contrast ratios, and the psychology behind color choices in digital interfaces.",
    category: "UI/UX",
    date: "Jun 10, 2026",
    readTime: "6 min read",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    title: "Building Scalable Storefronts with Next.js",
    excerpt:
      "Learn architectural patterns and performance techniques for high-traffic e-commerce applications.",
    category: "Engineering",
    date: "Jun 5, 2026",
    readTime: "12 min read",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Typography That Sells: A Creator's Guide",
    excerpt:
      "How strategic font pairing and hierarchy can elevate your digital products and boost conversions.",
    category: "Typography",
    date: "May 28, 2026",
    readTime: "5 min read",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    title: "Monetizing Your Creative Assets Online",
    excerpt:
      "Proven strategies for pricing, packaging, and marketing digital products to a global audience.",
    category: "Business",
    date: "May 20, 2026",
    readTime: "10 min read",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "AI-Powered Workflows for Designers",
    excerpt:
      "Discover how generative AI tools are reshaping creative workflows and what it means for the future of design.",
    category: "AI & Tools",
    date: "May 12, 2026",
    readTime: "7 min read",
    gradient: "from-cyan-500 to-sky-600",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen max-w-7xl py-20 px-6 lg:px-8 mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Our&nbsp;
          <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Blog
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Insights, tutorials, and inspiration for creators building premium
          digital products.
        </p>
      </div>

      {/* ── Post Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.title}
            className="glass-panel rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] hover:border-white/20 cursor-pointer group"
          >
            {/* Gradient image placeholder */}
            <div
              className={`aspect-video w-full bg-gradient-to-br ${post.gradient} relative`}
            >
              {/* Subtle noise overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              {/* Category badge */}
              <span className="inline-block self-start text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-white/10 text-primary mb-4">
                {post.category}
              </span>

              <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {post.title}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                {post.excerpt}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-4">
                <span>{post.date}</span>
                <span className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
                    />
                  </svg>
                  {post.readTime}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
