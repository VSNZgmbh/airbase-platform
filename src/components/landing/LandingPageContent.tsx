"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

// ── Shared animation variants ───────────────────────────────────────────────

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
  hidden: { opacity: 0, scale: 0.8 },
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

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 180, damping: 22 };

const vp = { once: true, margin: "-80px" as const };

// ── Component ────────────────────────────────────────────────────────────────

export function LandingPageContent({ locale }: { locale: string }) {
  const heroRef = useRef<HTMLElement>(null);

  // Parallax: track hero section scroll progress
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Background moves up slower than the page (parallax depth)
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  // Hero content fades and scales out as you scroll past
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.65], ["0%", "-12%"]);

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden" lang={locale}>

      {/* ── 1. Navigation — fades down from top ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200"
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
              <span className="italic font-normal text-gray-900">air</span>
              <span className="font-black text-gray-900 uppercase">BASE</span>
              <span className="text-[#D32F2F] font-black text-3xl leading-none ml-0.5">+</span>
            </motion.a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
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
                  className={
                    label === "DIENSTLEISTUNGEN"
                      ? "text-[#D32F2F] hover:text-[#b71c1c] transition-colors"
                      : "hover:text-gray-900 transition-colors"
                  }
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
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
                  className="inline-flex items-center gap-2 bg-[#D32F2F] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[#b71c1c] transition-colors"
                >
                  JETZT BUCHEN
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── 2. Hero — parallax background + staggered text ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen pt-16 flex flex-col overflow-hidden"
      >
        {/* Parallax background */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: "url('/images/hero-drones.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            y: bgY,
            scale: 1.12,
          }}
        />

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />

        {/* Swiss cross watermark */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none select-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 1.2, duration: 1.2 }}
        >
          <div className="flex gap-16">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="text-white text-6xl font-black leading-none"
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
            {/* Left: Tagline + services */}
            <div className="max-w-xl">
              <motion.p
                className="text-white/90 italic text-xl mb-4 drop-shadow-md"
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
                    className="text-white font-black leading-tight drop-shadow-lg"
                    style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
                    variants={{
                      hidden: { opacity: 0, x: -60, skewX: 5 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        skewX: 0,
                        transition: { delay: 0.5 + i * 0.12, duration: 0.7, ease },
                      },
                    }}
                  >
                    {service}
                  </motion.h2>
                ))}
              </motion.div>
            </div>

            {/* Right: CTA */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.7, ease }}
            >
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/book"
                  className="inline-block border-2 border-[#D32F2F] text-[#D32F2F] bg-white/10 backdrop-blur-sm font-black text-2xl px-10 py-5 rounded hover:bg-[#D32F2F] hover:text-white transition-all duration-200 tracking-wider drop-shadow-lg"
                >
                  JETZT BUCHEN
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile CTA */}
        <motion.div
          className="relative md:hidden text-center pb-32 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease }}
        >
          <Link
            href="/book"
            className="inline-block border-2 border-[#D32F2F] text-[#D32F2F] bg-white/20 backdrop-blur-sm font-black text-xl px-8 py-4 rounded hover:bg-[#D32F2F] hover:text-white transition-all duration-200"
          >
            JETZT BUCHEN
          </Link>
        </motion.div>
      </section>

      {/* ── 3. Value Strip ── */}
      <motion.section
        className="py-8 bg-white border-b border-gray-100"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        transition={{ duration: 0.8, ease }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center overflow-hidden">
          <motion.p
            className="text-[#D32F2F] font-bold text-lg sm:text-xl tracking-wide"
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
      <section id="dienstleistungen" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3"
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              Was wir tun
            </motion.p>
            <motion.h2
              className="text-4xl sm:text-5xl font-black text-gray-900"
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Vier Branchen. Eine Drohne. Unbegrenzte Möglichkeiten.
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            {[
              {
                title: "Transport",
                icon: "📦",
                desc: "Kein Weg? Kein Problem. Wir liefern Güter direkt dorthin, wo keine Strasse führt — schnell, sicher und kosteneffizient, überall in der Schweiz.",
                href: "/book?type=TRANSPORT",
              },
              {
                title: "Landwirtschaft",
                icon: "🌾",
                desc: "Mehr Ertrag, weniger Aufwand. Unsere Drohnen bringen Dünger, Saatgut und Pflanzenschutz präzise auf den Quadratmeter — schonend für Boden und Kultur.",
                href: "/book?type=LANDWIRTSCHAFT",
              },
              {
                title: "Reinigung",
                icon: "✨",
                desc: "Fassaden, Dächer, Solaranlagen — gereinigt ohne Gerüst. Unsere Drohnen erreichen, was Menschen nicht erreichen können. Sicher, schnell, kostensparend.",
                href: "/book?type=REINIGUNG",
              },
              {
                title: "Bau",
                icon: "🏗️",
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
                  boxShadow: "0 20px 40px rgba(211,47,47,0.12)",
                  borderColor: "#D32F2F",
                  transition: { duration: 0.25 },
                }}
                className="group border border-gray-200 rounded-2xl p-8 transition-colors duration-200 flex flex-col cursor-default"
              >
                <motion.div
                  className="text-4xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-1">{service.desc}</p>
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-[#D32F2F] font-bold text-sm mt-6 group-hover:gap-3 transition-all"
                >
                  Buchen <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. Speed Promise ── */}
      <motion.section
        className="py-16 bg-[#D32F2F] text-white overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={vp}
        transition={{ duration: 0.6, ease }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="text-7xl font-black mb-4 tabular-nums"
            initial={{ scale: 0.3, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={vp}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}
          >
            10"
          </motion.div>
          <motion.h2
            className="text-3xl font-black mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.3, duration: 0.6, ease }}
          >
            Offerte innert 10 Sekunden.
          </motion.h2>
          <motion.p
            className="text-white/80 text-lg max-w-xl mx-auto mb-8"
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
              className="inline-flex items-center gap-2 bg-white text-[#D32F2F] font-black px-8 py-4 rounded hover:bg-gray-100 transition-colors text-lg"
            >
              JETZT BUCHEN <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 6. How It Works ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3"
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              So funktionierts
            </motion.p>
            <motion.h2
              className="text-4xl font-black text-gray-900"
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              In vier Schritten vom Auftrag zur Lieferung.
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Animated connecting line */}
            <motion.div
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-[#D32F2F] origin-left"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={vp}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
            {/* Gray baseline behind it */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200" />

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
                    className="w-16 h-16 bg-white border-2 border-[#D32F2F] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10"
                    whileHover={{ scale: 1.15, boxShadow: "0 0 0 6px rgba(211,47,47,0.12)" }}
                    transition={spring}
                  >
                    <span className="text-[#D32F2F] font-black text-lg">{item.step}</span>
                  </motion.div>
                  <h3 className="font-black text-xl text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 7. Portal Entry Points ── */}
      <section id="app" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3"
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              airBASE APP
            </motion.p>
            <motion.h2
              className="text-4xl font-black text-gray-900"
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Alles im Blick — jederzeit.
            </motion.h2>
            <motion.p
              className="text-gray-600 text-lg mt-4 max-w-xl mx-auto"
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
                  boxShadow: "0 24px 48px rgba(211,47,47,0.1)",
                  borderColor: "#D32F2F",
                  transition: { duration: 0.25 },
                }}
                className="border-2 border-gray-200 rounded-2xl p-8 transition-colors text-center"
              >
                <motion.div
                  className="text-5xl mb-6"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={spring}
                >
                  {portal.icon}
                </motion.div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{portal.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{portal.desc}</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={portal.href}
                    className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded hover:bg-[#D32F2F] transition-colors text-sm"
                  >
                    {portal.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 8. Swiss Identity ── */}
      <section id="ueber-uns" className="py-20 bg-gray-50 border-t border-gray-200">
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
            className="text-4xl font-black text-gray-900 mt-6 mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ delay: 0.2, duration: 0.6, ease }}
          >
            Schweizer Qualität. Für die Lüfte.
          </motion.h2>

          <motion.p
            className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
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
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full cursor-default"
              >
                <span className="w-2 h-2 bg-[#D32F2F] rounded-full" />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 9. Franchise ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
            >
              <motion.p
                className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-4"
                variants={slideLeft}
                transition={{ duration: 0.5, ease }}
              >
                Wachsen Sie mit uns
              </motion.p>
              <motion.h2
                className="text-4xl font-black text-gray-900 mb-6"
                variants={slideLeft}
                transition={{ duration: 0.6, ease }}
              >
                Werden Sie Teil der Zukunft der Logistik.
              </motion.h2>
              <motion.p
                className="text-gray-600 text-lg leading-relaxed mb-8"
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
                  className="inline-flex items-center gap-2 border-2 border-[#D32F2F] text-[#D32F2F] font-black px-8 py-4 rounded hover:bg-[#D32F2F] hover:text-white transition-colors"
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
                    backgroundColor: "#fff5f5",
                    borderColor: "#D32F2F",
                    transition: { duration: 0.2 },
                  }}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <motion.span
                    className="text-[#D32F2F] font-black text-lg leading-none mt-0.5"
                    whileHover={{ scale: 1.3 }}
                    transition={spring}
                  >
                    +
                  </motion.span>
                  <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 10. Contact ── */}
      <section id="kontakt" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
          >
            <motion.p
              className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3"
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
            >
              Kontakt
            </motion.p>
            <motion.h2
              className="text-4xl font-black text-gray-900 mb-4"
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Sprechen wir.
            </motion.h2>
            <motion.p
              className="text-gray-600 text-lg"
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              Grosser Auftrag, Fragen oder Partnerschaft? Wir melden uns innert 24 Stunden — garantiert.
            </motion.p>
            <motion.p
              className="text-gray-500 mt-2 text-sm"
              variants={fadeUp}
              transition={{ duration: 0.6, ease }}
            >
              E-Mail:{" "}
              <a href="mailto:info@airbase.one" className="text-[#D32F2F] hover:underline font-semibold">
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
                <label className="block text-sm text-gray-700 font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="Ihr Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 font-semibold mb-2">Unternehmen</label>
                <input
                  type="text"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="Ihr Unternehmen"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
              <label className="block text-sm text-gray-700 font-semibold mb-2">E-Mail *</label>
              <input
                type="email"
                required
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors"
                placeholder="ihre@email.ch"
              />
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
              <label className="block text-sm text-gray-700 font-semibold mb-2">Nachricht *</label>
              <textarea
                required
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors resize-none"
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
                className="inline-flex items-center gap-2 bg-[#D32F2F] text-white font-black px-10 py-4 rounded hover:bg-[#b71c1c] transition-colors text-lg"
                whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(211,47,47,0.3)" }}
                whileTap={{ scale: 0.97 }}
              >
                NACHRICHT SENDEN <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.form>
        </div>
      </section>

      {/* ── 11. Footer ── */}
      <motion.footer
        className="bg-gray-900 text-white py-16"
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
                <span className="italic font-normal text-white">air</span>
                <span className="font-black text-white uppercase">BASE</span>
                <span className="text-[#D32F2F] font-black text-3xl leading-none ml-0.5">+</span>
              </a>
              <p className="text-gray-400 text-sm">Drohnenlogistik. Made in Switzerland.</p>
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
                  <h4 className="font-black text-white mb-3 uppercase text-xs tracking-widest">{col.heading}</h4>
                  <ul className="space-y-2 text-gray-400">
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

          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} airBASE — Alle Rechte vorbehalten.</span>
            <span>BAZL-konform · SORA-zertifiziert · Made in Switzerland 🇨🇭</span>
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
