import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

      {/* ── 2. Hero ── */}
      <section
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
            <div className="max-w-xl">
              <p className="text-white/90 italic text-xl mb-4 drop-shadow-md">
                Wir fliegen wenn andere stehen bleiben
              </p>
              <div className="space-y-1">
                {["Transport", "Landwirtschaft", "Reinigung", "Bau"].map((service) => (
                  <h2
                    key={service}
                    className="text-white font-black leading-tight drop-shadow-lg"
                    style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
                  >
                    {service}
                  </h2>
                ))}
              </div>
            </div>

            {/* Right: CTA */}
            <div className="hidden md:block">
              <Link
                href="/book"
                className="inline-block border-2 border-[#D32F2F] text-[#D32F2F] bg-white/10 backdrop-blur-sm font-black text-2xl px-10 py-5 rounded hover:bg-[#D32F2F] hover:text-white transition-all duration-200 tracking-wider drop-shadow-lg"
              >
                JETZT BUCHEN
              </Link>
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
        </div>
      </section>

      {/* ── 3. Value Strip ── */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[#D32F2F] font-bold text-lg sm:text-xl tracking-wide">
            nachhaltig — schnell — sicher — geringe Kosten — Offerte innert 10 Sekunden
          </p>
        </div>
      </section>

      {/* ── 4. Services ── */}
      <section id="dienstleistungen" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">Unsere Dienstleistungen</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">Was wir für Sie tun</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Transport",
                icon: "📦",
                desc: "Schwere Güter direkt ans Ziel — ohne Strasse, ohne Stau. Bis 100 kg Nutzlast, überall in der Schweiz.",
                href: "/book?type=TRANSPORT",
              },
              {
                title: "Landwirtschaft",
                icon: "🌾",
                desc: "Präzise Ausbringung von Dünger, Saatgut und Pflanzenschutzmitteln. Effizient, schonend, digital.",
                href: "/book?type=LANDWIRTSCHAFT",
              },
              {
                title: "Reinigung",
                icon: "✨",
                desc: "Fassaden, Solaranlagen, schwer zugängliche Flächen — Drohnenreinigung sicher und kostengünstig.",
                href: "/book?type=REINIGUNG",
              },
              {
                title: "Bau",
                icon: "🏗️",
                desc: "Baumaterial, Werkzeug und Ausrüstung direkt auf die Baustelle — kein Kran, keine Sperrung.",
                href: "/book?type=BAU",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="group border border-gray-200 rounded-2xl p-8 hover:border-[#D32F2F] hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-1">{service.desc}</p>
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-[#D32F2F] font-bold text-sm mt-6 group-hover:gap-3 transition-all"
                >
                  Buchen <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Speed Promise ── */}
      <section className="py-16 bg-[#D32F2F] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-7xl font-black mb-4">10"</div>
          <h2 className="text-3xl font-black mb-4">Offerte innert 10 Sekunden</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Kein Warten. Kein Formular. Kein Anruf. Einfach buchen — Preis sofort, Drohne folgt.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-[#D32F2F] font-black px-8 py-4 rounded hover:bg-gray-100 transition-colors text-lg"
          >
            JETZT BUCHEN <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── 6. How It Works ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">Ablauf</p>
            <h2 className="text-4xl font-black text-gray-900">So einfach funktioniert airBASE</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200" />
            {[
              { step: "01", title: "Buchen", desc: "Wählen Sie Ihren Service-Typ, Datum und Standort. Preis sofort." },
              { step: "02", title: "Bestätigen", desc: "Unser Team prüft die Anfrage und plant den Flug für Sie." },
              { step: "03", title: "Fliegen", desc: "Zertifizierter Pilot führt den Flug durch. Live-Tracking inklusive." },
              { step: "04", title: "Rechnung", desc: "Vollständiger Flugbericht und Rechnung automatisch per E-Mail." },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 bg-white border-2 border-[#D32F2F] rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-[#D32F2F] font-black text-lg">{item.step}</span>
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Portal Entry Points ── */}
      <section id="app" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">airBASE APP</p>
            <h2 className="text-4xl font-black text-gray-900">Ihr persönliches Portal</h2>
            <p className="text-gray-600 text-lg mt-4 max-w-xl mx-auto">
              Drei separate Portale — für Kunden, Piloten und Administratoren.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Kundenportal",
                desc: "Buchungen verwalten, Flugstatus verfolgen, Rechnungen einsehen.",
                icon: "👤",
                href: "/dashboard",
                cta: "Zum Kundenportal",
              },
              {
                title: "Administratorportal",
                desc: "Aufträge koordinieren, Piloten zuweisen, Flotten- und Preismanagement.",
                icon: "⚙️",
                href: "/operator",
                cta: "Zum Operatorenportal",
              },
              {
                title: "Pilotenportal",
                desc: "Flugaufträge annehmen, Wetter prüfen, NOTAMs einsehen, Bericht einreichen.",
                icon: "🛩️",
                href: "/pilot",
                cta: "Zum Pilotenportal",
              },
            ].map((portal) => (
              <div
                key={portal.title}
                className="border-2 border-gray-200 rounded-2xl p-8 hover:border-[#D32F2F] transition-colors group text-center"
              >
                <div className="text-5xl mb-6">{portal.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{portal.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{portal.desc}</p>
                <Link
                  href={portal.href}
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded hover:bg-[#D32F2F] transition-colors text-sm group"
                >
                  {portal.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Swiss Identity ── */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-6xl">🇨🇭</span>
          <h2 className="text-4xl font-black text-gray-900 mt-6 mb-4">
            Schweizer Qualität. Für die Lüfte.
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            airBASE ist ein Schweizer Drohnentechnologieunternehmen. Wir verbinden modernste
            Technologie mit Schweizer Präzision, Zuverlässigkeit und dem Anspruch, der beste
            Drohnenservice Europas zu werden.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {["SORA-zertifiziert", "BAZL-konform", "Swiss Made", "Berner Oberland"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full"
              >
                <span className="w-2 h-2 bg-[#D32F2F] rounded-full" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Franchise ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-4">Franchise</p>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Expandieren Sie mit uns</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                airBASE wird zur führenden Drohnen-Logistik-Franchise Europas. Wir suchen operative
                Partner in der Schweiz und weiteren Märkten, die unsere Technologie, Marke und
                Prozesse lizenzieren möchten.
              </p>
              <a
                href="#kontakt"
                className="inline-flex items-center gap-2 border-2 border-[#D32F2F] text-[#D32F2F] font-black px-8 py-4 rounded hover:bg-[#D32F2F] hover:text-white transition-colors"
              >
                FRANCHISE-ANFRAGE <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-3">
              {[
                "Vollständige technologische Infrastruktur (Buchungssystem, Dashboard, App)",
                "Marken- und Marketingunterstützung",
                "Regulatorisches Know-how & Lizenzunterstützung",
                "Schulung & Zertifizierung für Piloten und Operatoren",
                "Gemeinsame Wachstumsstrategie",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[#D32F2F] font-black text-lg leading-none mt-0.5">+</span>
                  <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Contact ── */}
      <section id="kontakt" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#D32F2F] text-sm font-bold uppercase tracking-widest mb-3">Kontakt</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Kontakt aufnehmen</h2>
            <p className="text-gray-600 text-lg">
              Fragen oder grosser Auftrag? Wir melden uns innerhalb von 24 Stunden.
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              E-Mail:{" "}
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
              <label className="block text-sm text-gray-700 font-semibold mb-2">Nachricht *</label>
              <textarea
                required
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#D32F2F] transition-colors resize-none"
                placeholder="Wie können wir Ihnen helfen?"
              />
            </div>
            <div className="text-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#D32F2F] text-white font-black px-10 py-4 rounded hover:bg-[#b71c1c] transition-colors text-lg"
              >
                NACHRICHT SENDEN <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── 11. Footer ── */}
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
            <span>© {new Date().getFullYear()} airBASE — Alle Rechte vorbehalten.</span>
            <span>BAZL-konform · SORA-zertifiziert · Made in Switzerland 🇨🇭</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
