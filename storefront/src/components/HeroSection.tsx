"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          Premium Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Products</span> Store
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Discover the best digital resources, software, e-books, and templates. Elevate your projects with top-tier assets created by industry professionals.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/categories"
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover:scale-105"
          >
            Explore Now
          </a>
          <a href="/products" className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors">
            Products <span aria-hidden="true">→</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
