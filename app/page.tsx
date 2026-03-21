"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Lock, BookOpen, Mail, Star, ImageIcon } from "lucide-react";
import ShaderHero from "./components/ShaderHero";
import TiltCard from "./components/TiltCard";

const features = [
  {
    icon: <ImageIcon className="w-5 h-5" />,
    title: "Moments",
    desc: "A private photo gallery of your favorite memories together.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Chapters",
    desc: "Write your story — rich entries that capture how you felt.",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Letters",
    desc: "Time-locked letters that open on a special date.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Invite-only",
    desc: "Share your memory lane only with the people you choose.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Just your circle",
    desc: "A private space that belongs to the people who matter most.",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Beautiful & minimal",
    desc: "No noise. Just your memories, beautifully kept.",
  },
];

const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 65,
      damping: 17,
      mass: 1.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#f5f5f5] flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-hidden">
        <ShaderHero />

        {/* Nav */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#2a2a2a] backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <svg
              viewBox="0 0 260 80"
              width="100"
              height="32"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              <text
                x="130"
                y="65"
                textAnchor="middle"
                fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
                fontWeight="900"
                fontSize="72"
                fill="none"
                stroke="#e4a0a0"
                strokeWidth="1.5"
                letterSpacing="-2"
                className="usly-text"
              >
                usly
              </text>
            </svg>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-[#888] hover:text-[#f5f5f5] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-1.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-full font-medium hover:bg-[#c47a7a] transition-colors"
              >
                Start free
              </Link>
            </div>
          </div>
        </nav>

        <div className="scroll-progress" aria-hidden="true" />

        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-2xl"
        >
          <motion.div
            variants={heroItemVariants}
            className="inline-flex items-center gap-1.5 text-xs text-[#e4a0a0] border border-[#e4a0a0]/30 rounded-full px-3 py-1 mb-8"
          >
            <Heart className="w-3 h-3 fill-current" />
            <span>Private. Invite-only. Yours.</span>
          </motion.div>
          <motion.h1
            variants={heroItemVariants}
            className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-6"
          >
            Your shared
            <br />
            <span className="text-[#e4a0a0]">memory lane</span>
          </motion.h1>
          <motion.p
            variants={heroItemVariants}
            className="text-lg text-[#888] leading-relaxed max-w-lg mx-auto mb-10"
          >
            A quiet corner of the internet for the people who matter most.
            Capture moments, write your story, and leave letters for the future.
          </motion.p>
          <motion.div
            variants={heroItemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.div
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <Link
                href="/signup"
                className="block px-8 py-3.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-full font-medium hover:bg-[#c47a7a] transition-colors text-base text-center"
              >
                Start your shared memory lane
              </Link>
            </motion.div>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#2a2a2a] text-[#f5f5f5] rounded-full font-medium hover:border-[#888] transition-colors text-base"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 55,
            damping: 16,
            delay: 0.45,
          }}
          className="relative z-10 mt-20 w-full max-w-5xl grid grid-cols-3 gap-3"
        >
          {[
            {
              title: "A walk in November",
              type: "A moment",
              src: "/landing-page/walk-in-nov.jpg",
            },
            {
              title: "Our first trip",
              type: "A chapter",
              src: "/landing-page/our-first-trip.jpg",
            },
            {
              title: "The letter I wrote you",
              type: "A letter",
              src: "/landing-page/the-letter-i-wrote-you.svg",
            },
          ].map((card) => (
            <TiltCard
              key={card.title}
              className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5 text-left hover:border-[#e4a0a0]/40 transition-all"
            >
              <div className="relative w-full h-42 rounded-xl overflow-hidden mb-3">
                <Image
                  src={card.src}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-[#e4a0a0] font-medium">{card.title}</p>
              <p className="text-xs text-[#888] mt-0.5">{card.type}</p>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-light text-center mb-16 tracking-tight">
            Everything you need to{" "}
            <span className="text-[#e4a0a0]">stay close</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 18,
                  delay: i * 0.09,
                }}
                className="border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#e4a0a0]/30 transition-all bg-[#141414]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#e4a0a0]/10 flex items-center justify-center text-[#e4a0a0] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-medium text-[#f5f5f5] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#888] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[#2a2a2a]">
        <div className="max-w-xl mx-auto text-center px-6">
          <h2 className="text-4xl font-light tracking-tight mb-5">
            Ready to start your
            <br />
            <span className="text-[#e4a0a0]">memory lane?</span>
          </h2>
          <p className="text-[#888] mb-8">
            Free to start. Private forever. For friends, family, and everyone in
            between.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="inline-flex"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e4a0a0] text-[#0b0b0b] rounded-full font-medium hover:bg-[#c47a7a] transition-colors text-base"
            >
              <Heart className="w-4 h-4 fill-current" />
              Begin your story
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#888]">
          <span>© {new Date().getFullYear()} usly</span>
          <span>Made with love, for love.</span>
        </div>
      </footer>
    </div>
  );
}
