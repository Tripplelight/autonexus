// src/pages/AboutPage.jsx

import { useSEO } from "../hooks/useSEO";
import { Car, Shield, Globe, Zap, ArrowRight, Sparkles, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const VALUES = [
  {
    icon: Zap,
    title: "AI-Powered Intelligence",
    desc: "Advanced search, smart recommendations, and market insights designed to help buyers make confident decisions.",
  },
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "Verified dealers, real listings, and a platform built around accountability from day one.",
  },
  {
    icon: Globe,
    title: "Built for East Africa",
    desc: "Designed around local realities while preparing for the future of automotive commerce across the region.",
  },
];

const STORY = [
  {
    title: "The Problem",
    text: "Buying a car often means jumping between scattered listings, comparing inconsistent prices, and hoping you're dealing with someone trustworthy.",
  },
  {
    title: "The Solution",
    text: "AutoNexus brings buyers and dealers together through one intelligent platform powered by technology, transparency, and trust.",
  },
  {
    title: "The Vision",
    text: "To become the platform powering how East Africa discovers, values, and purchases vehicles in the digital age.",
  },
];

const STATS = [
  { icon: Car, value: "100+", label: "Vehicles Listed" },
  { icon: Users, value: "Growing", label: "Dealer Network" },
  { icon: MapPin, value: "Kenya", label: "& Expanding" },
  { icon: Sparkles, value: "AI", label: "Powered Insights" },
];

export default function AboutPage() {
  useSEO({
    title: "About Us",
    description:
      "AutoNexus is building the future of automotive commerce in East Africa.",
  });

  return (
    <div className="relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-black overflow-hidden">
        {/* Hero photo layer */}
        <div
          className="fixed inset-0 opacity-40 -z-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2400')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
          }}
        />

        {/* TOP glow — brand orange, anchors hero */}
        <div className="absolute top-[-250px] left-[-150px] w-[750px] h-[750px] bg-brand-500/30 blur-[180px] rounded-full animate-pulse-slow" />
        <div className="absolute top-[-100px] right-[-200px] w-[500px] h-[500px] bg-brand-400/15 blur-[160px] rounded-full" />

        {/* MIDDLE glow — violet/purple, distinct mood shift */}
        <div className="absolute top-[35%] right-[-200px] w-[700px] h-[700px] bg-purple-500/20 blur-[200px] rounded-full" />
        <div className="absolute top-[55%] left-[-150px] w-[550px] h-[550px] bg-fuchsia-500/10 blur-[180px] rounded-full" />

        {/* BOTTOM glow — blue, original tone preserved */}
        <div className="absolute bottom-[-250px] right-[-100px] w-[750px] h-[750px] bg-blue-500/25 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-blue-400/10 blur-[160px] rounded-full" />

        {/* Smooth vertical blend so the photo + glows transition seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />

        {/* Center radial highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_65%)]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Subtle noise/vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* FLOATING DECORATIONS */}
      <div className="absolute top-32 left-10 w-32 h-32 border border-white/10 rounded-3xl rotate-12 backdrop-blur-xl bg-white/5 hidden lg:block animate-float-slow" />

      <div className="absolute right-16 top-56 w-48 h-48 rounded-full border border-brand-500/20 hidden lg:block" />

      <div className="absolute bottom-48 left-24 w-24 h-24 rounded-full bg-brand-500/10 blur-2xl hidden lg:block animate-pulse-slow" />

      <div className="absolute top-[60%] right-32 w-20 h-20 border border-purple-400/20 rounded-2xl rotate-45 hidden lg:block animate-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* HERO */}
        <section className="min-h-[90vh] flex items-center justify-center text-center">
          <div>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8 hover:border-brand-500/40 hover:bg-white/10 transition-all duration-500">
              <Car size={16} className="text-brand-400" />
              <span className="text-sm tracking-widest text-white/70">
                AUTONEXUS
              </span>
              <Sparkles size={14} className="text-brand-400/60" />
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight mb-8">
              THE FUTURE OF
              <span 
                className="block bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift"
                style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
                >
                AUTOMOTIVE
            </span>
              COMMERCE
            </h1>

            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-white/60 leading-relaxed mb-10">
              Building East Africa's most trusted vehicle marketplace where
              technology, transparency, and trust come together to transform
              how people buy and sell cars.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link
                to="/cars"
                className="btn-primary flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-500/20"
              >
                Explore Vehicles
                <ArrowRight size={16} />
              </Link>

              <Link to="/contact" className="btn-outline hover:scale-105 transition-transform duration-300">
                Contact Us
              </Link>
            </div>

            {/* STATS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:border-brand-500/30 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1"
                >
                  <stat.icon size={18} className="text-brand-400 mx-auto mb-2" />
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section className="grid md:grid-cols-3 gap-6 mb-32">

          {VALUES.map((item, i) => (
            <div
              key={item.title}
              className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-white/5
                backdrop-blur-xl
                p-8
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-brand-500/30
                hover:shadow-2xl
                hover:shadow-brand-500/10
                group
              "
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-brand-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-5 group-hover:bg-brand-500/20 group-hover:scale-110 transition-all duration-500">
                  <item.icon
                    size={20}
                    className="text-brand-400"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {item.title}
                </h3>

                <p className="text-white/50 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* STORY */}
        <section className="mb-32">

          <div className="text-center mb-16">
            <p className="uppercase tracking-[0.3em] text-brand-400 mb-3">
              Our Story
            </p>

            <h2 className="font-display text-4xl sm:text-5xl">
              Why AutoNexus Exists
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">

            {STORY.map((item, index) => (
              <div
                key={item.title}
                className="flex gap-6 md:gap-10 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-brand-500 shadow-lg shadow-brand-500/40 group-hover:shadow-brand-500/70 group-hover:scale-125 transition-all duration-500" />

                  {index !== STORY.length - 1 && (
                    <div className="w-px h-32 bg-gradient-to-b from-white/10 to-white/5" />
                  )}
                </div>

                <div className="pb-16">
                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-brand-400 transition-colors duration-500">
                    {item.title}
                  </h3>

                  <p className="text-white/55 leading-relaxed text-lg">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BIG VISION SECTION */}
        <section className="py-24 text-center relative">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[180px] rounded-full -z-10" />

          <p className="uppercase tracking-[0.4em] text-brand-400 mb-6">
            Our Vision
          </p>

          <h2 className="
            font-display
            text-4xl
            sm:text-6xl
            lg:text-7xl
            leading-tight
            max-w-5xl
            mx-auto
            mb-8
          ">
            Building the platform that powers how East Africa discovers,
            values, and purchases vehicles.
          </h2>

          <p className="max-w-3xl mx-auto text-white/50 text-lg leading-relaxed">
            We believe the future of automotive commerce will be digital,
            intelligent, and transparent. AutoNexus is laying the foundation
            for that future today.
          </p>

        </section>

        {/* CTA */}
        <section className="pb-24">

          <div className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-white/10
            bg-gradient-to-r
            from-brand-500/10
            via-white/5
            to-blue-500/10
            backdrop-blur-xl
            p-10
            sm:p-16
            text-center
            group
            hover:border-white/20
            transition-all
            duration-700
          ">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />

            <div className="absolute -left-20 -top-20 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full group-hover:bg-brand-500/20 transition-all duration-700" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

            <div className="relative">

              <h2 className="font-display text-4xl sm:text-5xl mb-5">
                Ready to Find Your Next Car?
              </h2>

              <p className="max-w-2xl mx-auto text-white/50 mb-8">
                Join a new generation of buyers and dealers using technology
                to make vehicle transactions smarter, safer, and more
                transparent.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/cars" className="btn-primary hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-500/20">
                  Browse Cars
                </Link>

                <Link to="/contact" className="btn-outline hover:scale-105 transition-transform duration-300">
                  Talk To Us
                </Link>
              </div>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}