"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Wind, Zap, Shield } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// ── Design system ────────────────────────────────────────────────────────────
// Swiss Modernism 2.0 × Space Tech Aerospace palette
// Bg: #080811  Surface: #0F172A  Border: #1E293B
// Text: #F8FAFC  Muted: #94A3B8  Brand: #D32F2F  Green: #22C55E

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

// ── Component ────────────────────────────────────────────────────────────────

export function LandingPageContent({ locale }: { locale: string }) {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-10%"]);
  const droneY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#080811", color: "#F8FAFC" }}
      lang={locale}
    >

      {/* ── 1. Navigation ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: "rgba(8,8,17,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "#1E293B",
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
              className="flex items-center gap-1 text-2xl tracking-tight select-none"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <span className="italic font-normal text-white/80">air</span>
              <span className="font-black text-white uppercase">BASE</span>
              <span className="font-black text-3xl leading-none ml-0.5" style={{ color: "#D32F2F" }}>+</span>
            </motion.a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#94A3B8" }}>
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
                  className="hover:text-white transition-colors"
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
                <Link href="/sign-in" className="text-sm hidden sm:block transition-colors" style={{ color: "#94A3B8" }}>
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

      {/* ── 2. Hero ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen pt-16 flex flex-col overflow-hidden"
      >
        {/* Cinematic backdrop */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            y: bgY,
            scale: 1.12,
          }}
        >
          <Image
            src="/images/flycart-scene-1.jpg"
            alt="DJI FlyCart drone over alpine landscape"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Dark overlay — deep space grade */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(8,8,17,0.85) 0%, rgba(8,8,17,0.55) 60%, rgba(8,8,17,0.75) 100%)" }} />
        </motion.div>

        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none" style={{ background: "linear-gradient(to top, #080811 0%, transparent 100%)" }} />

        {/* Swiss cross pattern */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none select-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
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
                className="italic text-xl mb-4"
                style={{ color: "rgba(248,250,252,0.75)" }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease }}
              >
                Wir fliegen — wenn andere stehen bleiben.
              </motion.p>

              <motion.div
                className="space-y-1"
                variants={stagger(0.1)}
                initial="hidden"
                animate="visible"
              >
                {["Transport", "Landwirtschaft", "Reinigung", "Bau"].map((service, i) => (
                  <motion.h2
                    key={service}
                    className="font-black leading-tight"
                    style={{
                      fontSize: "clamp(3rem, 7vw, 6rem)",
                      color: "#F8FAFC",
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      textShadow: "0 4px 32px rgba(0,0,0,0.6)",
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
                    className="inline-flex items-center gap-2 font-bold text-sm px-6 py-4 rounded border transition-colors"
                    style={{ color: "#F8FAFC", borderColor: "rgba(248,250,252,0.3)", background: "rgba(248,250,252,0.08)" }}
                  >
                    Mehr erfahren
                  </a>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: Animated drone PNG */}
            <motion.div
              className="hidden lg:block relative"
              style={{ y: droneY }}
              initial={{ opacity: 0, x: 80, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 1.0, ease }}
            >
              {/* Glow behind drone */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse, rgba(211,47,47,0.25) 0%, transparent 70%)",
                  transform: "scale(1.4)",
                  filter: "blur(40px)",
                }}
              />
              {/* Floating animation wrapper */}
              <motion.div
                animate={{ y: [0, -18, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              >
                {/* Rotor blur rings */}
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ width: 520, height: 24 }}
                  animate={{ scaleX: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
                >
                  <div className="w-full h-full rounded-full" style={{ background: "rgba(148,163,184,0.12)", filter: "blur(6px)" }} />
                </motion.div>

                <Image
                  src="/images/dji-flycart-100.png"
                  alt="DJI FlyCart 100 heavy-lift drone"
                  width={520}
                  height={360}
                  className="relative z-10 drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))" }}
                  priority
                />

                {/* Shadow on ground */}
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                  style={{ width: 280, height: 24, background: "rgba(0,0,0,0.45)", filter: "blur(18px)" }}
                  animate={{ scaleX: [1, 0.88, 1], opacity: [0.45, 0.3, 0.45] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                />
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
        style={{ background: "#0F172A", borderColor: "#1E293B" }}
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

      {/* ── 4. Services ── */}
      <section id="dienstleistungen" className="py-24" style={{ background: "#080811" }}>
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
                color: "#F8FAFC",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Vier Branchen. Eine Drohne. Unbegrenzte Möglichkeiten.
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            {[
              {
                title: "Transport",
                img: "/images/flycart-lastendrohne.webp",
                desc: "Kein Weg? Kein Problem. Wir liefern Güter direkt dorthin, wo keine Strasse führt — schnell, sicher und kosteneffizient, überall in der Schweiz.",
                href: "/book?type=TRANSPORT",
              },
              {
                title: "Landwirtschaft",
                img: "/images/flycart-ingenieurverkehr.webp",
                desc: "Mehr Ertrag, weniger Aufwand. Unsere Drohnen bringen Dünger, Saatgut und Pflanzenschutz präzise auf den Quadratmeter — schonend für Boden und Kultur.",
                href: "/book?type=LANDWIRTSCHAFT",
              },
              {
                title: "Reinigung",
                img: "/images/flycart-scene-2.webp",
                desc: "Fassaden, Dächer, Solaranlagen — gereinigt ohne Gerüst. Unsere Drohnen erreichen, was Menschen nicht erreichen können. Sicher, schnell, kostensparend.",
                href: "/book?type=REINIGUNG",
              },
              {
                title: "Bau",
                img: "/images/flycart-notfalltransport.webp",
                desc: "Kein Kran. Keine Strassensperrung. Material, Werkzeug und Ausrüstung kommen per Drohne — direkt auf Ihre Baustelle, egal wo sie liegt.",
                href: "/book?type=BAU",
              },
            ].map((service) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                transition={{ duration: 0.6, ease }}
                whileHover={{
                  y: -10,
                  borderColor: "#D32F2F",
                  transition: { duration: 0.25 },
                }}
                className="group rounded-2xl overflow-hidden flex flex-col border cursor-default"
                style={{ background: "#0F172A", borderColor: "#1E293B" }}
              >
                {/* Service image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)" }} />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="font-black text-white text-xl" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                      {service.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#94A3B8" }}>{service.desc}</p>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 font-bold text-sm mt-5 transition-all group-hover:gap-3"
                    style={{ color: "#D32F2F" }}
                  >
                    Buchen <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. Speed Promise ── */}
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
            className="font-black mb-3 tabular-nums"
            style={{ fontSize: "clamp(4rem, 12vw, 8rem)", color: "#F8FAFC", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
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
            style={{ color: "rgba(248,250,252,0.8)" }}
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
              className="inline-flex items-center gap-2 font-black px-8 py-4 rounded transition-colors text-lg"
              style={{ background: "#F8FAFC", color: "#D32F2F" }}
            >
              JETZT BUCHEN <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 6. Sustainability / Emissions ── */}
      <section id="nachhaltigkeit" className="py-24 border-b" style={{ background: "#080811", borderColor: "#1E293B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                style={{ color: "#22C55E" }}
                variants={slideLeft}
                transition={{ duration: 0.5, ease }}
              >
                Nachhaltig in der Luft
              </motion.p>
              <motion.h2
                className="font-black mb-6"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: "#F8FAFC",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Emissionsfreier Transport. Für Mensch und Natur.
              </motion.h2>
              <motion.p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "#94A3B8" }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Elektrisch betriebene Drohnen produzieren im Betrieb null direkte CO₂-Emissionen. Kein Diesel, kein Lärm, kein Stau — sondern die sauberste Art, Güter von A nach B zu bringen. In der Schweiz, wo saubere Energie und intakte Natur kein Luxus, sondern Identität sind.
              </motion.p>

              {/* Stats */}
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
                    whileHover={{
                      borderColor: "#22C55E",
                      transition: { duration: 0.2 },
                    }}
                    className="rounded-xl p-5 border"
                    style={{ background: "#0F172A", borderColor: "#1E293B" }}
                  >
                    <div className="flex items-center gap-2 mb-2" style={{ color: "#22C55E" }}>
                      {stat.icon}
                    </div>
                    <div
                      className="font-black text-3xl mb-1"
                      style={{ color: "#F8FAFC", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: "#94A3B8" }}>{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Drone image + sustainability badges */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={vp}
              transition={{ duration: 0.8, ease }}
            >
              {/* Green glow */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(34,197,94,0.12) 0%, transparent 70%)",
                  filter: "blur(30px)",
                }}
              />

              <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid #1E293B" }}>
                <Image
                  src="/images/flycart-scene-2.webp"
                  alt="Drohne im Alpeneinsatz — emissionsfrei"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                  style={{ height: 340 }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,17,0.85) 0%, transparent 50%)" }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-black text-white text-lg" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    Grüne Logistik beginnt in der Luft.
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>DJI FlyCart 100 — Elektrisch. Präzise. Zukunftsweisend.</p>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xl"
                style={{ background: "#0F172A", border: "1px solid #22C55E" }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              >
                <Leaf className="w-5 h-5" style={{ color: "#22C55E" }} />
                <span className="font-black text-sm text-white">Swiss Green Flight</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 7. How It Works ── */}
      <section className="py-24" style={{ background: "#0D1117" }}>
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
                color: "#F8FAFC",
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
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px" style={{ background: "#1E293B" }} />

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
                    style={{ background: "#0D1117", borderColor: "#D32F2F" }}
                    whileHover={{ scale: 1.15, boxShadow: "0 0 0 6px rgba(211,47,47,0.15)" }}
                    transition={spring}
                  >
                    <span className="font-black text-lg" style={{ color: "#D32F2F" }}>{item.step}</span>
                  </motion.div>
                  <h3
                    className="font-black text-xl mb-2"
                    style={{ color: "#F8FAFC", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 8. Portal Entry Points ── */}
      <section id="app" className="py-24 border-t" style={{ background: "#080811", borderColor: "#1E293B" }}>
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
              airBASE APP
            </motion.p>
            <motion.h2
              className="font-black"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#F8FAFC",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Alles im Blick — jederzeit.
            </motion.h2>
            <motion.p
              className="text-lg mt-4 max-w-xl mx-auto"
              style={{ color: "#94A3B8" }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Drei spezialisierte Portale — massgeschneidert für Kunden, Piloten und Betreiber.
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
                title: "Kundenportal",
                desc: "Buchen, verfolgen, abrechnen — alles an einem Ort. Behalten Sie Ihre Aufträge im Griff und verfolgen Sie Ihre Drohne in Echtzeit.",
                icon: "👤",
                href: "/dashboard",
                cta: "Zum Kundenportal",
              },
              {
                title: "Operatorenportal",
                desc: "Koordinieren Sie Aufträge, weisen Sie Piloten zu und behalten Sie Ihre gesamte Flotte im Überblick. Volle Kontrolle, jederzeit.",
                icon: "⚙️",
                href: "/operator",
                cta: "Zum Operatorenportal",
              },
              {
                title: "Pilotenportal",
                desc: "Ihr digitales Cockpit für jeden Einsatz. Aufträge annehmen, Wetter checken, NOTAMs prüfen, Bericht einreichen — alles sofort.",
                icon: "🛩️",
                href: "/pilot",
                cta: "Zum Pilotenportal",
              },
            ].map((portal) => (
              <motion.div
                key={portal.title}
                variants={scaleUp}
                transition={{ duration: 0.6, ease }}
                whileHover={{
                  y: -8,
                  borderColor: "#D32F2F",
                  transition: { duration: 0.25 },
                }}
                className="rounded-2xl p-8 text-center border-2"
                style={{ background: "#0F172A", borderColor: "#1E293B" }}
              >
                <motion.div
                  className="text-5xl mb-6"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={spring}
                >
                  {portal.icon}
                </motion.div>
                <h3
                  className="font-black text-2xl mb-3 text-white"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                >
                  {portal.title}
                </h3>
                <p className="leading-relaxed mb-6" style={{ color: "#94A3B8" }}>{portal.desc}</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={portal.href}
                    className="inline-flex items-center justify-center gap-2 font-bold px-6 py-3 rounded text-sm text-white transition-colors"
                    style={{ background: "#1E293B" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#D32F2F"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1E293B"; }}
                  >
                    {portal.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 9. Swiss Identity ── */}
      <section id="ueber-uns" className="py-20 border-t" style={{ background: "#0D1117", borderColor: "#1E293B" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              color: "#F8FAFC",
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
            style={{ color: "#94A3B8" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.35, duration: 0.6, ease }}
          >
            Gegründet im Herzen des Berner Oberlandes, vereint airBASE Schweizer Ingenieurskunst
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
            {["SORA-zertifiziert", "BAZL-konform", "Swiss Made", "Berner Oberland"].map((badge) => (
              <motion.span
                key={badge}
                variants={popIn}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                whileHover={{
                  scale: 1.08,
                  borderColor: "#D32F2F",
                  color: "#D32F2F",
                  transition: { duration: 0.15 },
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full cursor-default border"
                style={{ borderColor: "#1E293B", color: "#94A3B8" }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: "#D32F2F" }} />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 10. Franchise ── */}
      <section className="py-24 border-t" style={{ background: "#080811", borderColor: "#1E293B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  color: "#F8FAFC",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Werden Sie Teil der Zukunft der Logistik.
              </motion.h2>
              <motion.p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "#94A3B8" }}
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                airBASE ist mehr als ein Unternehmen — es ist ein Netzwerk. Wir bauen die führende
                Drohnenlogistik-Franchise Europas und suchen unternehmerische Partner, die unsere
                Technologie, Marke und bewährten Prozesse in ihrer Region einsetzen möchten.
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
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#D32F2F"; el.style.color = "#F8FAFC"; }}
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
                    borderColor: "#D32F2F",
                    transition: { duration: 0.2 },
                  }}
                  className="flex items-start gap-3 p-4 rounded-xl border"
                  style={{ background: "#0F172A", borderColor: "#1E293B" }}
                >
                  <motion.span
                    className="font-black text-lg leading-none mt-0.5"
                    style={{ color: "#D32F2F" }}
                    whileHover={{ scale: 1.3 }}
                    transition={spring}
                  >
                    +
                  </motion.span>
                  <span className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 11. Contact ── */}
      <section id="kontakt" className="py-24 border-t" style={{ background: "#0D1117", borderColor: "#1E293B" }}>
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
                color: "#F8FAFC",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Sprechen wir.
            </motion.h2>
            <motion.p
              className="text-lg"
              style={{ color: "#94A3B8" }}
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Grosser Auftrag, Fragen oder Partnerschaft? Wir melden uns innert 24 Stunden — garantiert.
            </motion.p>
            <motion.p
              className="mt-2 text-sm"
              style={{ color: "#64748B" }}
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
                <label className="block text-sm font-semibold mb-2" style={{ color: "#94A3B8" }}>Name *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none transition-colors"
                  style={{ background: "#0F172A", border: "1px solid #1E293B", color: "#F8FAFC" }}
                  placeholder="Ihr Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#94A3B8" }}>Unternehmen</label>
                <input
                  type="text"
                  className="w-full rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none transition-colors"
                  style={{ background: "#0F172A", border: "1px solid #1E293B", color: "#F8FAFC" }}
                  placeholder="Ihr Unternehmen"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#94A3B8" }}>E-Mail *</label>
              <input
                type="email"
                required
                className="w-full rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none transition-colors"
                style={{ background: "#0F172A", border: "1px solid #1E293B", color: "#F8FAFC" }}
                placeholder="ihre@email.ch"
              />
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#94A3B8" }}>Nachricht *</label>
              <textarea
                required
                rows={5}
                className="w-full rounded-xl px-4 py-3 placeholder-gray-600 focus:outline-none transition-colors resize-none"
                style={{ background: "#0F172A", border: "1px solid #1E293B", color: "#F8FAFC" }}
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
                className="inline-flex items-center gap-2 font-black px-10 py-4 rounded text-lg text-white transition-colors"
                style={{ background: "#D32F2F" }}
                whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(211,47,47,0.35)" }}
                whileTap={{ scale: 0.97 }}
              >
                NACHRICHT SENDEN <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.form>
        </div>
      </section>

      {/* ── 12. Footer ── */}
      <motion.footer
        className="py-16 border-t"
        style={{ background: "#030308", borderColor: "#1E293B" }}
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
              <a href="#" className="flex items-center gap-1 text-2xl tracking-tight select-none mb-3">
                <span className="italic font-normal text-white/70">air</span>
                <span className="font-black text-white uppercase">BASE</span>
                <span className="font-black text-3xl leading-none ml-0.5" style={{ color: "#D32F2F" }}>+</span>
              </a>
              <p className="text-sm" style={{ color: "#475569" }}>Drohnenlogistik. Made in Switzerland.</p>
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
                    className="font-black text-white mb-3 uppercase text-xs tracking-widest"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    {col.heading}
                  </h4>
                  <ul className="space-y-2" style={{ color: "#475569" }}>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="hover:text-white transition-colors">
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
            style={{ borderColor: "#1E293B", color: "#334155" }}
          >
            <span>© {new Date().getFullYear()} airBASE — Alle Rechte vorbehalten.</span>
            <span>BAZL-konform · SORA-zertifiziert · Made in Switzerland 🇨🇭</span>
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
