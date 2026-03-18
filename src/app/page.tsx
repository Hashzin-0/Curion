'use client';

import { Hero } from "@/modules/landing/components/Hero";
import { Features } from "@/modules/landing/components/Features";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-300">
      <div className="max-w-5xl w-full text-center space-y-8 mt-20 mb-20">
        <Hero />
        <Features />
      </div>
      <Footer />
    </div>
  );
}
