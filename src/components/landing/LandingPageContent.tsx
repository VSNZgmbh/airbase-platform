"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Wind, Zap, Shield, MapPin } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// ── Design system ────────────────────────────────────────────────────────────
// Swiss Modernism 2.0 × Light Glassmorphism edition
// Bg: #FFFFFF / #F8FAFC  Surface: rgba(255,255,255,0.7)
// Text: #0F172A  Muted: #64748B  Brand: #D32F2F  Green: #16A34A
// Glassmorphism: backdrop-blur(16px), rgba(255,255,255,0.65), border rgba(255,255,255,0.4)

// ── Animation constants ──────────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 180, damping: 22 };

const vp = { once: true, margin: "-60px" as const };

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideLeft = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0 },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const stagger = (delay = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

// ── Glassmorphism style helper ───────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
};

const glassDark = {
  background: "rgba(15,23,42,0.55)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
};

// ── Component ────────────────────────────────────────────────────────────────

export function LandingPageContent({ locale }: { locale: string }) {
  const heroRef = useRef<HTMLElement>(null);
  const swissRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: swissScrollProgress } = useScroll({
    target: swissRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-10%"]);
  const swissBgY = useTransform(swissScrollProgress, [0, 1], ["-15%", "15%"]);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#F8FAFC", color: "#0F172A" }}
      lang={locale}
    >

      {/* ── 1. Navigation ── */}
      <motion.header
        className="sticky top-0 left-0 right-0 z-50 border-b"
        style={{
          background: "#FFFFFF",
          borderColor: "#E2E8F0",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center select-none"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <img src="/airbase-logo.png" alt="airBASE" className="h-10 w-auto" />
            </motion.a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#64748B" }}>
              {["HOME", "DIENSTLEISTUNGEN", "AIRBASE APP", "ÜBER UNS", "KONTAKT"].map((label, i) => (
                <motion.a
                  key={label}
                  href={
                    label === "DIENSTLEISTUNGEN" ? "#dienstleistungen"
                    : label === "AIRBASE APP" ? "#app"
                    : label === "ÜBER UNS" ? "#ueber-uns"
                    : label === "KONTAKT" ? "#kontakt"
                    : "#"
                  }
                  className="hover:text-gray-900 transition-colors"
                  style={label === "DIENSTLEISTUNGEN" ? { color: "#D32F2F" } : {}}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease }}
                  whileHover={{ y: -1 }}
                >
                  {label}
                </motion.a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} />
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>
                <Link href="/sign-in" className="text-sm hidden sm:block transition-colors" style={{ color: "#64748B" }}>
                  Anmelden
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, duration: 0.4, ease }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 text-white text-sm font-black px-4 py-2 rounded transition-colors"
                  style={{ background: "#D32F2F" }}
                >
                  JETZT BUCHEN
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── 2. Hero — mountain panorama with drones ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen pt-16 flex flex-col overflow-hidden"
      >
        {/* Mountain panorama backdrop */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: bgY, scale: 1.12 }}
        >
          <Image
            src="/images/hero-drones.jpg"
            alt="Alpine mountain panorama with drones"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Light overlay — airy, premium */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.35) 60%, rgba(15,23,42,0.50) 100%)" }} />
        </motion.div>

        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none" style={{ background: "linear-gradient(to top, #F8FAFC 0%, transparent 100%)" }} />

        {/* Swiss cross pattern */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none select-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: 1.2, duration: 1.5 }}
        >
          <div className="flex gap-20">
            {[...Array(7)].map((_, i) => (
              <motion.span
                key={i}
                className="text-white font-black leading-none"
                style={{ fontSize: "5rem" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.08, duration: 0.6, ease }}
              >+</motion.span>
            ))}
          </div>
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center"
          style={{ opacity: heroContentOpacity, y: heroContentY }}
        >
          <div className="flex w-full items-center justify-between pt-24 pb-40">
            {/* Left: Tagline + service words */}
            <div className="max-w-xl z-10">
              <motion.p
                className="font-black text-white mb-6"
                style={{
                  fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  textShadow: "0 2px 16px rgba(0,0,0,0.4)",
                  letterSpacing: "-0.01em",
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease }}
              >
                Wir fliegen — wenn andere stehen bleiben.
              </motion.p>

              <motion.div
                className="space-y-0"
                variants={stagger(0.1)}
                initial="hidden"
                animate="visible"
              >
                {["Transport", "Bau", "Landwirtschaft", "Reinigung"].map((service, i) => (
                  <motion.h2
                    key={service}
                    className="font-black text-white"
                    style={{
                      fontSize: "clamp(3rem, 7vw, 6rem)",
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      textShadow: "0 4px 32px rgba(0,0,0,0.4)",
                      lineHeight: "0.95",
                    }}
                    variants={{
                      hidden: { opacity: 0, x: -60, skewX: 5 },
                      visible: {
                        opacity: 1, x: 0, skewX: 0,
                        transition: { delay: 0.5 + i * 0.12, duration: 0.7, ease },
                      },
                    }}
                  >
                    {service}
                  </motion.h2>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6, ease }}
              >
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 font-black text-lg px-8 py-4 rounded transition-colors text-white"
                    style={{ background: "#D32F2F" }}
                  >
                    JETZT BUCHEN <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a
                    href="#dienstleistungen"
                    className="inline-flex items-center gap-2 font-bold text-sm px-6 py-4 rounded transition-colors text-white"
                    style={glassDark}
                  >
                    Mehr erfahren
                  </a>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: frosted glass stat card */}
            <motion.div
              className="hidden lg:block relative"
              initial={{ opacity: 0, x: 80, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 1.0, ease }}
            >
              <motion.div
                className="rounded-3xl p-8 text-white"
                style={glassDark}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <div className="text-6xl font-black mb-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: "#D32F2F" }}>10&quot;</div>
                <div className="text-xl font-bold text-white mb-1">Offerte innert</div>
                <div className="text-xl font-bold text-white mb-4">10 Sekunden</div>
                <div className="text-sm text-white/70">Kein Warten. Kein Formular.</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-green-300 font-semibold">Jetzt aktiv</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            className="w-px h-12"
            style={{ background: "linear-gradient(to bottom, rgba(211,47,47,0.8), transparent)" }}
            animate={{ scaleY: [1, 1.4, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ── 3. Value Strip ── */}
      <motion.section
        className="py-6 border-y"
        style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        transition={{ duration: 0.8, ease }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center overflow-hidden">
          <motion.p
            className="font-bold text-lg sm:text-xl tracking-wide"
            style={{ color: "#D32F2F" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.6, ease }}
          >
            nachhaltig · schnell · sicher · günstig · Offerte innert 10 Sekunden
          </motion.p>
        </div>
      </motion.section>

      {/* ── 4. Services — glassmorphism cards over image backgrounds ── */}
      <section id="dienstleistungen" className="py-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-sm font-black uppercase tracking-widest mb-3"
              style={{ color: "#D32F2F" }}
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              Was wir tun
            </motion.p>
            <motion.h2
              className="font-black"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                color: "#0F172A",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Vier Branchen. Eine Drohne. Unbegrenzte Möglichkeiten.
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            {[
              {
                title: "Transport",
                img: "/images/flycart-lastendrohne.webp",
                desc: "Kein Weg? Kein Problem. Wir liefern Güter direkt dorthin, wo keine Strasse führt — schnell, sicher und kosteneffizient.",
                href: "/book",
                comingSoon: false,
              },
              {
                title: "Bau",
                img: "/images/flycart-notfalltransport.webp",
                desc: "Kein Kran. Keine Strassensperrung. Material, Werkzeug und Ausrüstung kommen per Drohne — direkt auf Ihre Baustelle.",
                href: "/book",
                comingSoon: false,
              },
              {
                title: "Landwirtschaft",
                img: "/images/flycart-ingenieurverkehr.webp",
                desc: "Mehr Ertrag, weniger Aufwand. Unsere Drohnen bringen Dünger, Saatgut und Pflanzenschutz präzise auf den Quadratmeter.",
                href: "#dienstleistungen",
                comingSoon: true,
              },
              {
                title: "Reinigung",
                img: "/images/flycart-scene-2.webp",
                desc: "Fassaden, Dächer, Solaranlagen — gereinigt ohne Gerüst. Unsere Drohnen erreichen, was Menschen nicht erreichen können.",
                href: "#dienstleistungen",
                comingSoon: true,
              },
              {
                title: "Solar",
                img: "/images/flycart-scene-2.webp",
                desc: "PV-Anlagen und Infrastruktur — inspiziert und gewartet per Drohne, ohne Gerüst oder Absperrung.",
                href: "#dienstleistungen",
                comingSoon: true,
              },
              {
                title: "Notfall",
                img: "/images/flycart-notfalltransport.webp",
                desc: "Medizinische Güter und Rettungsausrüstung — in Minuten vor Ort, wenn jede Sekunde zählt.",
                href: "#dienstleistungen",
                comingSoon: true,
              },
            ].map((service) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                transition={{ duration: 0.6, ease }}
                whileHover={{ y: -10, transition: { duration: 0.25 } }}
                className={`group relative rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow ${service.comingSoon ? "opacity-80" : ""}`}
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
              >
                {/* Service image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${service.comingSoon ? "grayscale-[30%]" : ""}`}
                  />
                  {/* Coming Soon badge */}
                  {service.comingSoon && (
                    <div className="absolute top-3 right-3 z-20 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white" style={{ background: "#64748B" }}>
                      Coming Soon
                    </div>
                  )}
                  {/* Glassmorphism title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4" style={glassDark}>
                    <h3 className="font-black text-white text-xl" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {service.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#64748B" }}>{service.desc}</p>
                  {service.comingSoon ? (
                    <span
                      className="inline-flex items-center gap-2 font-bold text-sm mt-5"
                      style={{ color: "#94A3B8" }}
                    >
                      Bald verfügbar
                    </span>
                  ) : (
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 font-bold text-sm mt-5 transition-all group-hover:gap-3"
                      style={{ color: "#D32F2F" }}
                    >
                      Buchen <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Coming Soon hover tooltip */}
                {service.comingSoon && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                    <div className="rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-xl" style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)" }}>
                      Coming Soon
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. Drone Showcase — DJI FlyCart 100 ── */}
      <section className="relative py-32 overflow-hidden" style={{ background: "#FFFFFF" }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Floating drone PNG */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: -60, scale: 0.85 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={vp}
              transition={{ duration: 0.9, ease }}
            >
              {/* Glow */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse, rgba(211,47,47,0.3) 0%, transparent 70%)",
                    transform: "scale(1.6)",
                    filter: "blur(50px)",
                  }}
                />
                <motion.div
                  animate={{ y: [0, -18, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                >
                  {/* Rotor blur ring */}
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ width: 620, height: 24 }}
                    animate={{ scaleX: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
                  >
                    <div className="w-full h-full rounded-full" style={{ background: "rgba(255,255,255,0.15)", filter: "blur(6px)" }} />
                  </motion.div>

                  <Image
                    src="/images/dji-flycart-100.png"
                    alt="DJI FlyCart 100 heavy-lift drone"
                    width={620}
                    height={440}
                    className="relative z-10 drop-shadow-2xl"
                    style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.3))" }}
                  />

                  <motion.div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                    style={{ width: 260, height: 22, background: "rgba(0,0,0,0.4)", filter: "blur(18px)" }}
                    animate={{ scaleX: [1, 0.88, 1], opacity: [0.4, 0.25, 0.4] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Right: glassmorphism info card */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={vp}
              transition={{ duration: 0.8, ease }}
            >
              <div className="rounded-3xl p-8 lg:p-12" style={{ background: "#0F172A", boxShadow: "0 20px 60px rgba(15,23,42,0.18)" }}>
                <p className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: "#D32F2F" }}>
                  Unsere Flotte
                </p>
                <h2
                  className="font-black mb-4 text-white"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                >
                  DJI FlyCart 100
                </h2>
                <p className="text-lg mb-8" style={{ color: "rgba(248,250,252,0.8)" }}>
                  Die leistungsstärkste Lastendrohne ihrer Klasse. Bis 100 kg Nutzlast (Einzelbatterie, 6 km Reichweite) oder bis 85 kg mit Doppelbatterie (12 km Reichweite). MTOW 170 kg. SORA-geprüft und BAZL-konform für den kommerziellen Einsatz in der Schweiz.
                </p>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { value: "100kg", label: "Max. Nutzlast" },
                    { value: "6km", label: "Reichweite (1 Akku)" },
                    { value: "12km", label: "Reichweite (2 Akkus, ≤85 kg)" },
                    { value: "0g", label: "CO₂" },
                  ].map((spec) => (
                    <div key={spec.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <div className="font-black text-2xl text-white mb-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{spec.value}</div>
                      <div className="text-xs" style={{ color: "rgba(248,250,252,0.6)" }}>{spec.label}</div>
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 font-black px-8 py-4 rounded text-white"
                    style={{ background: "#D32F2F" }}
                  >
                    JETZT BUCHEN <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. Speed Promise ── */}
      <motion.section
        className="py-20 overflow-hidden"
        style={{ background: "#D32F2F" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={vp}
        transition={{ duration: 0.6, ease }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="font-black mb-3 tabular-nums text-white"
            style={{ fontSize: "clamp(4rem, 12vw, 8rem)", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            initial={{ scale: 0.3, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={vp}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}
          >
            10&quot;
          </motion.div>
          <motion.h2
            className="font-black mb-4 text-white"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.3, duration: 0.6, ease }}
          >
            Offerte innert 10 Sekunden.
          </motion.h2>
          <motion.p
            className="text-lg max-w-xl mx-auto mb-8"
            style={{ color: "rgba(248,250,252,0.85)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.4, duration: 0.6, ease }}
          >
            Kein Warten. Kein Formular. Kein Anruf. Wählen Sie Ihren Service, geben Sie Ihren Standort ein — Ihre Offerte erscheint sofort. Die Drohne kommt.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.5, duration: 0.6, ease }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/book"
              className="inline-flex items-center gap-2 font-black px-8 py-4 rounded text-lg"
              style={{ background: "#FFFFFF", color: "#D32F2F" }}
            >
              JETZT BUCHEN <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 7. Sustainability / Emissions — with background image + glassmorphism ── */}
      <section id="nachhaltigkeit" className="relative py-24 overflow-hidden">
        {/* Background image — green landscape (no color overlay) */}
        <div className="absolute inset-0">
          <Image
            src="/images/flycart-lastendrohne.webp"
            alt="Drohne über grüner Landschaft"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Stats + copy */}
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
            >
              <motion.p
                className="text-sm font-black uppercase tracking-widest mb-4"
                style={{ color: "#4ADE80" }}
                variants={slideLeft}
                transition={{ duration: 0.5, ease }}
              >
                Nachhaltig in der Luft
              </motion.p>
              <motion.h2
                className="font-black mb-6"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: "#FFFFFF",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Emissionsfreier Transport. Für Mensch und Natur.
              </motion.h2>
              <motion.p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "rgba(248,250,252,0.85)" }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Elektrisch betriebene Drohnen produzieren im Betrieb null direkte CO₂-Emissionen. Kein Diesel, kein Lärm, kein Stau — die sauberste Art, Güter zu transportieren.
              </motion.p>

              {/* Stats with glassmorphism */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={stagger(0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={vp}
              >
                {[
                  { value: "0g", label: "CO₂ im Flug", icon: <Leaf className="w-5 h-5" /> },
                  { value: "–85%", label: "Lärmemission vs. Helikopter", icon: <Wind className="w-5 h-5" /> },
                  { value: "100%", label: "Elektrisch betrieben", icon: <Zap className="w-5 h-5" /> },
                  { value: "5×", label: "effizienter als Bodenweg", icon: <Shield className="w-5 h-5" /> },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={scaleUp}
                    transition={{ duration: 0.5, ease }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    className="rounded-xl p-5"
                    style={glass}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: "#16A34A" }}>
                      {stat.icon}
                    </div>
                    <div
                      className="font-black text-3xl mb-1"
                      style={{ color: "#0F172A", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: "#64748B" }}>{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Glassmorphism card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={vp}
              transition={{ duration: 0.8, ease }}
            >
              <div className="relative rounded-3xl overflow-hidden p-8" style={glass}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#16A34A" }}>
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-lg" style={{ color: "#0F172A", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Swiss Green Flight</p>
                    <p className="text-sm" style={{ color: "#64748B" }}>Zertifiziert · Emissionsfrei</p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed mb-6" style={{ color: "#334155" }}>
                  In der Schweiz, wo saubere Energie und intakte Natur kein Luxus, sondern Identität sind, setzt AIRBASE neue Standards für grüne Logistik.
                </p>
                <div className="rounded-xl overflow-hidden">
                  <Image
                    src="/images/flycart-scene-2.webp"
                    alt="Grüne Drohnenlogistik"
                    width={500}
                    height={240}
                    className="w-full object-cover"
                    style={{ height: 200 }}
                  />
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xl"
                style={glass}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              >
                <Leaf className="w-5 h-5" style={{ color: "#16A34A" }} />
                <span className="font-black text-sm" style={{ color: "#0F172A" }}>Swiss Green Flight</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 8. How It Works ── */}
      <section className="py-24" style={{ background: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-sm font-black uppercase tracking-widest mb-3"
              style={{ color: "#D32F2F" }}
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              So funktionierts
            </motion.p>
            <motion.h2
              className="font-black"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#0F172A",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              In vier Schritten vom Auftrag zur Lieferung.
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Animated connecting line */}
            <motion.div
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px origin-left"
              style={{ background: "#D32F2F" }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={vp}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px" style={{ background: "#E2E8F0" }} />

            <motion.div
              className="contents"
              variants={stagger(0.15)}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
            >
              {[
                { step: "01", title: "Buchen", desc: "Service, Datum und Standort wählen. Ihre Offerte erscheint innert 10 Sekunden." },
                { step: "02", title: "Bestätigen", desc: "Unser Team prüft die Anfrage und plant Ihren Flug — innert kürzester Zeit." },
                { step: "03", title: "Fliegen", desc: "Ein zertifizierter Pilot übernimmt. Sie verfolgen den Flug in Echtzeit." },
                { step: "04", title: "Abrechnen", desc: "Vollständiger Flugbericht und Rechnung — automatisch in Ihr Postfach." },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  transition={{ duration: 0.6, ease }}
                  className="relative text-center"
                  whileHover={{ y: -4 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 border-2"
                    style={{ background: "#FFFFFF", borderColor: "#D32F2F" }}
                    whileHover={{ scale: 1.15, boxShadow: "0 0 0 6px rgba(211,47,47,0.12)" }}
                    transition={spring}
                  >
                    <span className="font-black text-lg" style={{ color: "#D32F2F" }}>{item.step}</span>
                  </motion.div>
                  <h3
                    className="font-black text-xl mb-2"
                    style={{ color: "#0F172A", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 9. Portal Entry Points ── */}
      <section id="app" className="py-24 border-t" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-sm font-black uppercase tracking-widest mb-3"
              style={{ color: "#D32F2F" }}
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              AIRBASE APP
            </motion.p>
            <motion.h2
              className="font-black"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#0F172A",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Alles im Blick — jederzeit.
            </motion.h2>
            <motion.p
              className="text-lg mt-4 max-w-xl mx-auto"
              style={{ color: "#64748B" }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Drei spezialisierte Dashboards — massgeschneidert für Kunden, Piloten und Admin/Safety.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            {[
              {
                title: "Kunden-Dashboard",
                desc: "Missionen buchen, Live-Tracking verfolgen, mit Ihrem Piloten chatten, Rechnungen verwalten — alles an einem Ort. Ihr komplettes Kundenportal.",
                icon: "👤",
                href: "/dashboard",
                cta: "Kunden-Dashboard",
              },
              {
                title: "Piloten-Dashboard",
                desc: "Ihr digitales Cockpit für jeden Einsatz. Aufträge annehmen, Wetter checken, NOTAMs prüfen, Telemetrie überwachen, Post-Flight Reports einreichen.",
                icon: "🛩️",
                href: "/pilot",
                cta: "Piloten-Dashboard",
              },
              {
                title: "Admin & Safety",
                desc: "Finanzen, Flottenmanagement, SORA-Compliance, Flugfreigaben, Risikobewertung, Franchise-Netzwerk und Team — ein Dashboard für die gesamte Betriebsführung.",
                icon: "🛡️",
                href: "/admin",
                cta: "Admin & Safety",
              },
            ].map((portal) => (
              <motion.div
                key={portal.title}
                variants={scaleUp}
                transition={{ duration: 0.6, ease }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25 },
                }}
                className="rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-shadow"
                style={{ ...glass, border: "1px solid rgba(255,255,255,0.6)" }}
              >
                <motion.div
                  className="text-5xl mb-6"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={spring}
                >
                  {portal.icon}
                </motion.div>
                <h3
                  className="font-black text-2xl mb-3"
                  style={{ color: "#0F172A", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {portal.title}
                </h3>
                <p className="leading-relaxed mb-6" style={{ color: "#64748B" }}>{portal.desc}</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={portal.href}
                    className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded text-sm transition-colors text-white"
                    style={{ background: "#D32F2F" }}
                  >
                    {portal.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 10. Swiss Identity ── */}
      <section ref={swissRef} id="ueber-uns" className="relative py-20 overflow-hidden">
        {/* Parallax background image */}
        <motion.div
          className="absolute inset-0 w-full"
          style={{ y: swissBgY, scale: 1.15 }}
        >
          <Image
            src="/images/flycart-scene-1.jpg"
            alt="Drohne über Schweizer Alpenlandschaft"
            fill
            className="object-cover object-center"
          />
        </motion.div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.62)" }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            className="text-6xl inline-block"
            initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={vp}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            🇨🇭
          </motion.span>

          <motion.h2
            className="font-black mt-6 mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#FFFFFF",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.2, duration: 0.6, ease }}
          >
            Schweizer Qualität. Für die Lüfte.
          </motion.h2>

          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(248,250,252,0.85)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.35, duration: 0.6, ease }}
          >
            Gegründet im Herzen des Berner Oberlandes, vereint AIRBASE Schweizer Ingenieurskunst
            mit dem Mut, Logistik neu zu denken. Unsere Vision: der verlässlichste Drohnenservice
            Europas — bodenständig, präzise, vorausschauend.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-10"
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            {["SORA-geprüft", "BAZL-konform", "Swiss Made", "Berner Oberland"].map((badge) => (
              <motion.span
                key={badge}
                variants={popIn}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                whileHover={{
                  scale: 1.08,
                  transition: { duration: 0.15 },
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full cursor-default border shadow-sm"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#FFFFFF", background: "rgba(255,255,255,0.15)" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: "#D32F2F" }} />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 11. Swiss Map — HQ & Bases ── */}
      <section className="relative py-24 overflow-hidden" style={{ background: "#F1F5F9" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-sm font-black uppercase tracking-widest mb-3"
              style={{ color: "#D32F2F" }}
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              Unser Netzwerk
            </motion.p>
            <motion.h2
              className="font-black"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#0F172A",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Heimatbasis Berner Oberland.
            </motion.h2>
            <motion.p
              className="text-lg mt-4 max-w-xl mx-auto"
              style={{ color: "#64748B" }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Hauptsitz in Wilderswil — operational im Herzen der Schweizer Alpen. Korridor: Interlaken → Grindelwald → Lauterbrunnen → Brienz.
            </motion.p>
          </motion.div>

          <motion.div
            className="relative rounded-3xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={vp}
            transition={{ duration: 0.8, ease }}
          >
            {/* Map image — freestanding, fully visible */}
            <div className="relative" style={{ height: 520, background: "#F8FAFC" }}>
              <Image
                src="/images/swiss-map.webp"
                alt="Schweiz Karte — AIRBASE Netzwerk"
                fill
                className="object-contain"
              />

              {/* Glassmorphism overlay at bottom */}
              <div
                className="absolute inset-x-0 bottom-0 h-32"
                style={{ background: "linear-gradient(to top, rgba(241,245,249,0.95) 0%, transparent 100%)" }}
              />

              {/* HQ Marker — Wilderswil */}
              <motion.div
                className="absolute"
                style={{ top: "52%", left: "47%" }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={vp}
                transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
              >
                {/* Pulse rings */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 60,
                    height: 60,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(211,47,47,0.2)",
                    border: "2px solid rgba(211,47,47,0.4)",
                  }}
                  animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(211,47,47,0.25)",
                    border: "1px solid rgba(211,47,47,0.5)",
                  }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut", delay: 0.4 }}
                />

                {/* HQ dot */}
                <div
                  className="relative rounded-full z-10"
                  style={{
                    width: 18,
                    height: 18,
                    background: "#D32F2F",
                    border: "3px solid #FFFFFF",
                    boxShadow: "0 0 0 2px #D32F2F, 0 4px 12px rgba(211,47,47,0.5)",
                  }}
                />

                {/* HQ Label — glassmorphism tooltip */}
                <motion.div
                  className="absolute left-6 -top-8 rounded-xl px-3 py-2 whitespace-nowrap"
                  style={glass}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={vp}
                  transition={{ delay: 0.9, duration: 0.5, ease }}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#D32F2F" }} />
                    <span className="font-black text-xs" style={{ color: "#0F172A" }}>HQ — Wilderswil</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>Mittelweg 9, 3812</div>
                </motion.div>
              </motion.div>

              {/* Glassmorphism info card top-left */}
              <motion.div
                className="absolute top-6 left-6 rounded-2xl p-5"
                style={glass}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={vp}
                transition={{ delay: 0.6, duration: 0.6, ease }}
              >
                <p className="font-black text-sm mb-3" style={{ color: "#0F172A", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  AIRBASE Swiss
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: "Hauptsitz", value: "Wilderswil, Berner Oberland" },
                    { label: "Korridor", value: "Interlaken → Grindelwald" },
                    { label: "Status", value: "Operationell 2025", dot: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.dot && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />}
                      <span className="text-xs" style={{ color: "#475569" }}>
                        <span className="font-semibold">{item.label}:</span> {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 12. Franchise — with background image ── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/images/flycart-lastendrohne.webp"
            alt="Drohnenflotte"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "rgba(248,250,252,0.92)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
            >
              <motion.p
                className="text-sm font-black uppercase tracking-widest mb-4"
                style={{ color: "#D32F2F" }}
                variants={slideLeft}
                transition={{ duration: 0.5, ease }}
              >
                Wachsen Sie mit uns
              </motion.p>
              <motion.h2
                className="font-black mb-6"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: "#0F172A",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Werden Sie Teil der Zukunft der Logistik.
              </motion.h2>
              <motion.p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "#475569" }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                AIRBASE ist mehr als ein Unternehmen — es ist ein Netzwerk. Wir bauen die führende
                Drohnenlogistik-Franchise Europas und suchen unternehmerische Partner.
              </motion.p>
              <motion.div
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <a
                  href="#kontakt"
                  className="inline-flex items-center gap-2 font-black px-8 py-4 rounded border-2 transition-colors"
                  style={{ borderColor: "#D32F2F", color: "#D32F2F" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#D32F2F"; el.style.color = "#FFFFFF"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "#D32F2F"; }}
                >
                  FRANCHISE-ANFRAGE <ArrowRight className="w-5 h-5" />
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="space-y-3"
              variants={stagger(0.09)}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
            >
              {[
                "Vollständige Technologie-Infrastruktur: Buchungssystem, Piloten-App, Operatoren-Dashboard",
                "Marken- und Marketingunterstützung vom ersten Tag an",
                "Umfassendes Know-how für Regulatorik, BAZL-Zulassungen und Lizenzen",
                "Ausbildung und Zertifizierung für Piloten und Operatoren",
                "Persönliche Begleitung und gemeinsame Wachstumsstrategie",
              ].map((item) => (
                <motion.div
                  key={item}
                  variants={slideLeft}
                  transition={{ duration: 0.5, ease }}
                  whileHover={{
                    x: 6,
                    transition: { duration: 0.2 },
                  }}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={glass}
                >
                  <motion.span
                    className="font-black text-lg leading-none mt-0.5"
                    style={{ color: "#D32F2F" }}
                    whileHover={{ scale: 1.3 }}
                    transition={spring}
                  >
                    +
                  </motion.span>
                  <span className="text-sm leading-relaxed" style={{ color: "#475569" }}>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 13. Contact ── */}
      <section id="kontakt" className="py-24 border-t" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-sm font-black uppercase tracking-widest mb-3"
              style={{ color: "#D32F2F" }}
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              Kontakt
            </motion.p>
            <motion.h2
              className="font-black mb-4"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#0F172A",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Sprechen wir.
            </motion.h2>
            <motion.p
              className="text-lg"
              style={{ color: "#64748B" }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Grosser Auftrag, Fragen oder Partnerschaft? Wir melden uns innert 24 Stunden — garantiert.
            </motion.p>
            <motion.p
              className="mt-2 text-sm"
              style={{ color: "#94A3B8" }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              E-Mail:{" "}
              <a href="mailto:info@airbase.one" className="font-semibold hover:underline" style={{ color: "#D32F2F" }}>
                info@airbase.one
              </a>
            </motion.p>
          </motion.div>

          <motion.form
            action="mailto:info@airbase.one"
            method="get"
            className="space-y-4"
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.div
              className="grid sm:grid-cols-2 gap-4"
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#475569" }}>Name *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                  placeholder="Ihr Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#475569" }}>Unternehmen</label>
                <input
                  type="text"
                  className="w-full rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                  placeholder="Ihr Unternehmen"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#475569" }}>E-Mail *</label>
              <input
                type="email"
                required
                className="w-full rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                placeholder="ihre@email.ch"
              />
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#475569" }}>Nachricht *</label>
              <textarea
                required
                rows={5}
                className="w-full rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A" }}
                placeholder="Beschreiben Sie Ihr Anliegen..."
              />
            </motion.div>
            <motion.div
              className="text-center pt-2"
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              <motion.button
                type="submit"
                className="inline-flex items-center gap-2 font-black px-10 py-4 rounded text-lg text-white"
                style={{ background: "#D32F2F" }}
                whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(211,47,47,0.3)" }}
                whileTap={{ scale: 0.97 }}
              >
                NACHRICHT SENDEN <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.form>
        </div>
      </section>

      {/* ── 14. Footer ── */}
      <motion.footer
        className="py-16 border-t"
        style={{ background: "#F1F5F9", borderColor: "#E2E8F0" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={vp}
        transition={{ duration: 0.8, ease }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ delay: 0.1, duration: 0.6, ease }}
            >
              <a href="#" className="flex items-center select-none mb-3">
                <img src="/airbase-logo.png" alt="airBASE" className="h-8 w-auto" />
              </a>
              <p className="text-sm" style={{ color: "#94A3B8" }}>VSNZ GmbH · Drohnenlogistik. Made in Switzerland.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
              {[
                {
                  heading: "Dienste",
                  links: [
                    { label: "Transport", href: "#dienstleistungen" },
                    { label: "Landwirtschaft", href: "#dienstleistungen" },
                    { label: "Reinigung", href: "#dienstleistungen" },
                    { label: "Bau", href: "#dienstleistungen" },
                  ],
                },
                {
                  heading: "Portale",
                  links: [
                    { label: "Kundenportal", href: "/dashboard" },
                    { label: "Operatorenportal", href: "/operator" },
                    { label: "Pilotenportal", href: "/pilot" },
                  ],
                },
                {
                  heading: "Unternehmen",
                  links: [
                    { label: "Über uns", href: "#ueber-uns" },
                    { label: "Franchise", href: "#" },
                    { label: "Kontakt", href: "#kontakt" },
                  ],
                },
                {
                  heading: "Rechtliches",
                  links: [
                    { label: "AGB", href: "#" },
                    { label: "Datenschutz", href: "#" },
                    { label: "Impressum", href: "#" },
                  ],
                },
              ].map((col, colIdx) => (
                <motion.div
                  key={col.heading}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ delay: 0.1 + colIdx * 0.08, duration: 0.5, ease }}
                >
                  <h4
                    className="font-black mb-3 uppercase text-xs tracking-widest"
                    style={{ color: "#0F172A", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    {col.heading}
                  </h4>
                  <ul className="space-y-2" style={{ color: "#94A3B8" }}>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="hover:text-gray-900 transition-colors">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          <div
            className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
            style={{ borderColor: "#E2E8F0", color: "#94A3B8" }}
          >
            <span>© {new Date().getFullYear()} VSNZ GmbH — Alle Rechte vorbehalten.</span>
            <span>BAZL-konform · SORA-geprüft · Made in Switzerland 🇨🇭</span>
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
