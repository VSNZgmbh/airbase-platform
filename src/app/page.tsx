import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { getLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default async function LandingPage() {
  const locale = await getLocale();

  return (
    <main className="min-h-screen bg-white text-gray-900" lang={locale}>

      {/* ── 1. Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-1 text-2xl tracking-tight select-none">
              <span className="italic font-normal text-gray-900">air</span>
              <span className="font-black text-gray-900 uppercase">BASE</span>
              <span className="text-[#D32F2F] font-black text-3xl leading-none ml-0.5">+</span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">HOME</a>
              <a href="#dienstleistungen" className="text-[#D32F2F] hover:text-[#b71c1c] transition-colors">DIENSTLEISTUNGEN</a>
              <a href="#app" className="hover:text-gray-900 transition-colors">AIRBASE APP</a>
              <a href="#ueber-uns" className="hover:text-gray-900 transition-colors">ÜBER UNS</a>
              <a href="#kontakt" className="hover:text-gray-900 transition-colors">KONTAKT</a>
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} />
              <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                Anmelden
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-[#D32F2F] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[#b71c1c] transition-colors"
              >
                JETZT BUCHEN
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero ──
          ANIMATION TARGET: Parallax background on scroll, hero text elements fade+slide in on load.
          Left block: tagline slides from left, service names stagger from bottom.
          Right CTA: fade in with slight delay.
      */}
      <section
        data-section="hero"
        className="relative min-h-screen pt-16 flex flex-col"
        style={{
          backgroundImage: "url('/images/hero-drones.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        {/* Bottom fade to white */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />

        {/* Swiss cross watermark pattern */}
        <div className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none select-none overflow-hidden">
          <div className="flex gap-16 opacity-15">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-white text-6xl font-black leading-none">+</span>
            ))}
          </div>
        </div>

        {/* Hero content */}
        <div className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex w-full items-center justify-between pt-24 pb-40">
            {/* Left: Tagline + services */}
            <div className="max-w-xl" data-animate="hero-left">
              <p className="text-white/90 italic text-xl mb-4 drop-shadow-md" data-animate="hero-tagline">
                Wir fliegen wenn andere stehen bleiben.
              </p>
              <div className="space-y-1">
                {["Transport", "Landwirtschaft", "Reinigung", "Bau"].map((service, i) => (
                  <h2
                    key={service}
                    data-animate="hero-service"
                    data-index={i}
                    className="text-white font-black leading-tight drop-shadow-lg"
                    style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
                  >
                    {service}
                  </h2>
                ))}
              </div>
              <p className="text-white/80 text-base mt-6 max-w-sm drop-shadow" data-animate="hero-sub">
                Drohnenservices für die Schweiz — präzise, nachhaltig und zuverlässig.
              </p>
            </div>

            {/* Right: CTA */}
            <div className="hidden md:flex flex-col items-end gap-4" data-animate="hero-right">
              <Link
                href="/book"
                className="inline-block border-2 border-[#D32F2F] text-[#D32F2F] bg-white/10 backdrop-blur-sm font-black text-2xl px-10 py-5 rounded hover:bg-[#D32F2F] hover:text-white transition-all duration-200 tracking-wider drop-shadow-lg"
              >
                JETZT BUCHEN
              </Link>
              <span className="text-white/60 text-sm italic">Offerte innert 10 Sekunden</span>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="relative md:hidden text-center pb-32 px-4">
          <Link
            href="/book"
            className="inline-block border-2 border-[#D32F2F] text-[#D32F2F] bg-white/20 backdrop-blur-sm font-black text-xl px-8 py-4 rounded hover:bg-[#D32F2F] hover:text-white transition-all duration-200"
          >
            JETZT BUCHEN
          </Link>
          <p className="text-white/60 text-sm italic mt-2">Offerte innert 10 Sekunden</p>
        </div>
      </section>

      {/* ── 3. Value Strip ──
          ANIMATION TARGET: Typewriter or word-reveal on scroll entry.
      */}
      <section className="py-8 bg-white border-b border-gray-100" data-section="value-strip">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[#D32F2F] font-bold text-lg sm:text-xl tracking-wide" data-animate="value-strip">
            Nachhaltig · Präzise · Zuverlässig · Ihre Offerte in 10 Sekunden
          </p>
        </div>
      </section>

      {/* ── 4. Services ──
          ANIMATION TARGET: Cards stagger-animate in from bottom as user scrolls into section.
          Each card entrance is delayed by index * 100ms.
          Icon: subtle bounce on card hover.
      */}
      <section id="dienstleistungen" className="py-24 bg-white" data-section="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-animate="section-header">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">Unsere Dienstleistungen</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Was wir für Sie bewegen</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
              Vier Branchen. Ein System. Null Kompromisse.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Transport",
                icon: "📦",
                tagline: "Kein Weg zu weit.",
                desc: "Bis zu 100 kg direkt ans Ziel — über Berg, Schlucht und Gelände. Schneller als jede Strasse, präziser als jeder Kran.",
                href: "/book?type=TRANSPORT",
              },
              {
                title: "Landwirtschaft",
                icon: "🌾",
                tagline: "Mehr Ertrag. Weniger Aufwand.",
                desc: "Präzise Ausbringung von Dünger, Saatgut und Pflanzenschutz auf den Quadratmeter genau. Digital gesteuert, ressourcenschonend.",
                href: "/book?type=LANDWIRTSCHAFT",
              },
              {
                title: "Reinigung",
                icon: "✨",
                tagline: "Sauber. Sicher. Ohne Gerüst.",
                desc: "Solaranlagen, Fassaden, Brücken und schwer zugängliche Flächen — makellos gereinigt, ohne Risiko für Mensch und Material.",
                href: "/book?type=REINIGUNG",
              },
              {
                title: "Bau",
                icon: "🏗️",
                tagline: "Material. Exakt. Dorthin.",
                desc: "Baumaterial und Ausrüstung direkt auf die Baustelle — ohne Kran, ohne Sperrung, ohne Zeitverlust. Der nächste Schritt in der Baulogistik.",
                href: "/book?type=BAU",
              },
            ].map((service, i) => (
              <div
                key={service.title}
                data-animate="service-card"
                data-index={i}
                className="group border border-gray-200 rounded-2xl p-8 hover:border-[#D32F2F] hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="text-4xl mb-4 transition-transform duration-200 group-hover:scale-110">{service.icon}</div>
                <p className="text-[#D32F2F] text-xs font-bold uppercase tracking-widest mb-1">{service.tagline}</p>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-1 text-sm">{service.desc}</p>
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-[#D32F2F] font-bold text-sm mt-6 group-hover:gap-3 transition-all"
                >
                  Jetzt buchen <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Speed Promise ──
          ANIMATION TARGET: Large "10"" counter animates from 0 to 10 with a typewriter/count-up effect.
          Background section slides in as cinematic reveal.
      */}
      <section className="py-20 bg-[#D32F2F] text-white overflow-hidden" data-section="speed-promise">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-6">Unser Versprechen</p>
          <div className="text-8xl sm:text-9xl font-black mb-2 leading-none" data-animate="counter" data-target="10">10"</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-6">Von der Anfrage zur Offerte</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Kein Warten. Kein Formular. Kein Anruf.<br />
            Einfach buchen — Preis sofort, Drohne folgt.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-[#D32F2F] font-black px-10 py-4 rounded hover:bg-gray-100 transition-colors text-lg"
          >
            JETZT BUCHEN <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── 6. Stats ──
          ANIMATION TARGET: Numbers count up when section enters viewport.
          Each stat fades + slides up with stagger delay.
      */}
      <section className="py-20 bg-white border-b border-gray-100" data-section="stats">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100", unit: "kg", label: "Maximale Nutzlast" },
              { value: "10", unit: "Sek.", label: "Bis zur Offerte" },
              { value: "4", unit: "", label: "Branchen bedient" },
              { value: "100", unit: "%", label: "BAZL-konform" },
            ].map((stat, i) => (
              <div key={stat.label} data-animate="stat" data-index={i} className="flex flex-col items-center">
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className="text-5xl sm:text-6xl font-black text-gray-900"
                    data-counter-target={stat.value}
                  >
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-2xl font-black text-[#D32F2F] mb-1">{stat.unit}</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. How It Works ──
          ANIMATION TARGET: Steps appear sequentially with connecting line drawing animation.
          Each circle scales in, then line draws to next, then text fades in.
      */}
      <section className="py-24 bg-gray-50" data-section="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-animate="section-header">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">So funktioniert es</p>
            <h2 className="text-4xl font-black text-gray-900">Von Klick zu Flug — in vier Schritten</h2>
            <p className="text-gray-500 text-lg mt-4 max-w-xl mx-auto">
              Kein Telefon. Keine E-Mail. Kein Papierkram. Einfach digital.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200" data-animate="connector-line" />
            {[
              {
                step: "01",
                title: "Buchen",
                desc: "Service, Datum und Standort wählen. Preis erscheint sofort — keine Überraschungen.",
              },
              {
                step: "02",
                title: "Bestätigen",
                desc: "Unser Team prüft die Anfrage, plant den Flug und bestätigt per App und E-Mail.",
              },
              {
                step: "03",
                title: "Fliegen",
                desc: "BAZL-zertifizierter Pilot führt den Einsatz durch. Echtzeit-Tracking inklusive.",
              },
              {
                step: "04",
                title: "Abschliessen",
                desc: "Vollständiger Flugbericht und finale Rechnung automatisch — alles digital und transparent.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center" data-animate="step" data-index={i}>
                <div className="w-16 h-16 bg-white border-2 border-[#D32F2F] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-sm">
                  <span className="text-[#D32F2F] font-black text-lg">{item.step}</span>
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Testimonials ──
          ANIMATION TARGET: Cards slide in from alternating sides on scroll.
          Quote icon animates opacity from 0.
          Stars appear with sparkle effect.
      */}
      <section className="py-24 bg-white" data-section="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-animate="section-header">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">Kundenstimmen</p>
            <h2 className="text-4xl font-black text-gray-900">Was unsere Kunden sagen</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Mit airBASE sparen wir pro Einsatz bis zu drei Stunden Lieferzeit. Die Drohnenlogistik hat unsere Baustellenkoordination im Berggebiet komplett verändert.",
                author: "Thomas Meier",
                role: "Bauunternehmer",
                region: "Interlaken",
                service: "Bau",
              },
              {
                quote: "Endlich können wir Solaranlagen auf schwer zugänglichen Dächern reinigen — ohne Gerüst, ohne Risiko. Die Qualität übertrifft alle Erwartungen.",
                author: "Sandra Müller",
                role: "Gebäudemanagement",
                region: "Berner Oberland",
                service: "Reinigung",
              },
              {
                quote: "Die 10-Sekunden-Offerte ist kein Marketingversprechen — es ist Realität. Wir buchen seither alles digital. Einfacher geht es nicht.",
                author: "Markus Wyss",
                role: "Landwirt",
                region: "Interlaken",
                service: "Landwirtschaft",
              },
            ].map((t, i) => (
              <div
                key={t.author}
                data-animate="testimonial"
                data-index={i}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#D32F2F]/30 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <Quote className="w-8 h-8 text-[#D32F2F] opacity-30 mb-4" />
                <p className="text-gray-700 leading-relaxed flex-1 italic text-sm">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{t.author}</p>
                    <p className="text-gray-500 text-xs">{t.role} · {t.region}</p>
                  </div>
                  <span className="text-[#D32F2F] text-xs font-bold uppercase tracking-wide border border-[#D32F2F]/30 px-2 py-1 rounded">
                    {t.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Portal Entry Points ──
          ANIMATION TARGET: Cards scale up from 0.95 with opacity fade on scroll entry.
          Hover: subtle lift + border colour transition.
      */}
      <section id="app" className="py-24 bg-gray-50" data-section="portals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-animate="section-header">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">airBASE APP</p>
            <h2 className="text-4xl font-black text-gray-900">Ihr persönliches Portal</h2>
            <p className="text-gray-600 text-lg mt-4 max-w-xl mx-auto">
              Drei Portale. Drei Perspektiven. Ein System.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Kundenportal",
                desc: "Buchungen verwalten, Flugstatus in Echtzeit verfolgen, Rechnungen und Flugberichte einsehen.",
                icon: "👤",
                href: "/dashboard",
                cta: "Zum Kundenportal",
              },
              {
                title: "Operatorenportal",
                desc: "Aufträge koordinieren, Piloten zuweisen, Preise und Flotte verwalten — alles in einem Dashboard.",
                icon: "⚙️",
                href: "/operator",
                cta: "Zum Operatorenportal",
              },
              {
                title: "Pilotenportal",
                desc: "Flugaufträge annehmen, Wetterdaten prüfen, NOTAMs einsehen und Flugbericht einreichen.",
                icon: "🛩️",
                href: "/pilot",
                cta: "Zum Pilotenportal",
              },
            ].map((portal, i) => (
              <div
                key={portal.title}
                data-animate="portal-card"
                data-index={i}
                className="border-2 border-gray-200 rounded-2xl p-8 hover:border-[#D32F2F] hover:shadow-lg transition-all duration-300 group text-center bg-white"
              >
                <div className="text-5xl mb-6 transition-transform duration-200 group-hover:scale-110">{portal.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{portal.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">{portal.desc}</p>
                <Link
                  href={portal.href}
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded hover:bg-[#D32F2F] transition-colors text-sm"
                >
                  {portal.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Swiss Identity ──
          ANIMATION TARGET: Section background does a slow Ken Burns zoom effect.
          Badge pills pop in with stagger.
          Heading words reveal with a clip-path wipe.
      */}
      <section id="ueber-uns" className="py-24 bg-white border-t border-gray-200" data-section="swiss-identity">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-animate="swiss-text">
              <span className="text-6xl mb-6 block">🇨🇭</span>
              <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-4">Über uns</p>
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                Schweizer Qualität.<br />Für die Lüfte.
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                airBASE ist ein Schweizer Unternehmen mit Wurzeln im Berner Oberland. Präzision,
                Verlässlichkeit und höchste Qualitätsansprüche sind keine Versprechen — sie sind
                unser Standard.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                Wir wurden entwickelt, um die Schweizer Industrie in die Zukunft der Luftlogistik
                zu führen — vom Bergdorf bis zur Grossbaustelle, von der Alp bis zum Stadtrand.
              </p>
            </div>
            <div className="space-y-4" data-animate="swiss-badges">
              {[
                { badge: "SORA-zertifiziert", desc: "Vollständig konform mit dem Specific Operations Risk Assessment Framework der EASA." },
                { badge: "BAZL-konform", desc: "Alle Flüge gemäss den Vorschriften des Bundesamts für Zivilluftfahrt." },
                { badge: "Swiss Made", desc: "Entwickelt, betrieben und optimiert in der Schweiz — für Schweizer Verhältnisse." },
                { badge: "Berner Oberland", desc: "Verwurzelt in der Region Interlaken — ein Team, das das Gelände kennt." },
              ].map((item, i) => (
                <div
                  key={item.badge}
                  data-animate="badge-item"
                  data-index={i}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#D32F2F]/40 transition-colors"
                >
                  <span className="w-2 h-2 bg-[#D32F2F] rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-black text-gray-900 text-sm mb-0.5">{item.badge}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Franchise ──
          ANIMATION TARGET: Left text block slides from left, right list items stagger from right.
      */}
      <section className="py-24 bg-gray-50 border-t border-gray-200" data-section="franchise">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-animate="franchise-text">
              <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-4">Franchise</p>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Werden Sie Teil von airBASE</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                airBASE wird zur führenden Drohnen-Logistik-Franchise Europas. Wir suchen operative
                Partner in der Schweiz, Österreich und weiteren Märkten — die unsere Technologie,
                Marke und Prozesse einsetzen möchten.
              </p>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Sie bringen den Markt. Wir bringen das System. Gemeinsam fliegen wir höher.
              </p>
              <a
                href="#kontakt"
                className="inline-flex items-center gap-2 border-2 border-[#D32F2F] text-[#D32F2F] font-black px-8 py-4 rounded hover:bg-[#D32F2F] hover:text-white transition-colors"
              >
                FRANCHISE-ANFRAGE <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-3" data-animate="franchise-list">
              {[
                "Vollständige technologische Infrastruktur (Buchungssystem, Dashboard, App)",
                "Marken- und Marketingunterstützung von Anfang an",
                "Regulatorisches Know-how & Lizenzunterstützung für Ihren Markt",
                "Schulung & Zertifizierung für Piloten und Operatoren",
                "Gemeinsame Wachstumsstrategie und exklusive Gebietsrechte",
              ].map((item, i) => (
                <div
                  key={item}
                  data-animate="franchise-item"
                  data-index={i}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#D32F2F]/40 transition-colors"
                >
                  <span className="text-[#D32F2F] font-black text-lg leading-none mt-0.5">+</span>
                  <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Contact ── */}
      <section id="kontakt" className="py-24 bg-white border-t border-gray-200" data-section="contact">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-animate="section-header">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">Kontakt</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Sprechen wir.</h2>
            <p className="text-gray-600 text-lg">
              Grossauftrag, Partnerschaft oder Fragen? Wir antworten innerhalb von 24 Stunden.
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              <a href="mailto:info@airbase.one" className="text-[#D32F2F] hover:underline font-semibold">
                info@airbase.one
              </a>
            </p>
          </div>

          <form action="mailto:info@airbase.one" method="get" className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
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
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-2">E-Mail *</label>
              <input
                type="email"
                required
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors"
                placeholder="ihre@email.ch"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-2">Wie können wir Ihnen helfen? *</label>
              <textarea
                required
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors resize-none"
                placeholder="Beschreiben Sie Ihr Projekt oder Ihre Anfrage..."
              />
            </div>
            <div className="text-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#D32F2F] text-white font-black px-10 py-4 rounded hover:bg-[#b71c1c] transition-colors text-lg"
              >
                NACHRICHT SENDEN <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-gray-400 text-xs mt-3">Antwort innert 24 Stunden · keine Weitergabe Ihrer Daten</p>
            </div>
          </form>
        </div>
      </section>

      {/* ── 13. Footer ── */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
            <div>
              <a href="#" className="flex items-center gap-1 text-2xl tracking-tight select-none mb-3">
                <span className="italic font-normal text-white">air</span>
                <span className="font-black text-white uppercase">BASE</span>
                <span className="text-[#D32F2F] font-black text-3xl leading-none ml-0.5">+</span>
              </a>
              <p className="text-gray-400 text-sm">Schweizer Drohnentechnologie</p>
              <p className="text-gray-500 text-xs mt-1">VSNZ GmbH · Berner Oberland</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
              <div>
                <h4 className="font-black text-white mb-3 uppercase text-xs tracking-widest">Dienste</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#dienstleistungen" className="hover:text-white transition-colors">Transport</a></li>
                  <li><a href="#dienstleistungen" className="hover:text-white transition-colors">Landwirtschaft</a></li>
                  <li><a href="#dienstleistungen" className="hover:text-white transition-colors">Reinigung</a></li>
                  <li><a href="#dienstleistungen" className="hover:text-white transition-colors">Bau</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-white mb-3 uppercase text-xs tracking-widest">Portale</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Kundenportal</Link></li>
                  <li><Link href="/operator" className="hover:text-white transition-colors">Operatorenportal</Link></li>
                  <li><Link href="/pilot" className="hover:text-white transition-colors">Pilotenportal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-white mb-3 uppercase text-xs tracking-widest">Unternehmen</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#ueber-uns" className="hover:text-white transition-colors">Über uns</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Franchise</a></li>
                  <li><a href="#kontakt" className="hover:text-white transition-colors">Kontakt</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-white mb-3 uppercase text-xs tracking-widest">Rechtliches</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} airBASE by VSNZ GmbH — Alle Rechte vorbehalten.</span>
            <span>BAZL-konform · SORA-zertifiziert · Made in Switzerland 🇨🇭</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
