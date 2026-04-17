import Link from "next/link";
import { ArrowRight, CheckCircle, Mountain, Zap, Package, Factory } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-white" lang="de">

      {/* ── 1. Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="font-bold text-xl tracking-tight">
              AIRBASE<span className="text-[#00B4D8]">.ONE</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
              <a href="#dienste" className="hover:text-white transition-colors">Dienste</a>
              <a href="#so-funktionierts" className="hover:text-white transition-colors">Wie es funktioniert</a>
              <a href="#anwendungen" className="hover:text-white transition-colors">Anwendungsfälle</a>
              <a href="#sicherheit" className="hover:text-white transition-colors">Sicherheit</a>
              <a href="#partner" className="hover:text-white transition-colors">Partner werden</a>
              <a href="#kontakt" className="hover:text-white transition-colors">Kontakt</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">
                Anmelden
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-[#00B4D8] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#0093b8] transition-colors"
              >
                JETZT BUCHEN <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Hero ── */}
      <section className="pt-32 pb-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00B4D8]/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-[#00B4D8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-[#00B4D8]/20">
            <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
            Jetzt verfügbar in der Schweiz & Österreich
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold leading-[1.05] mb-8 max-w-3xl" style={{ hyphens: "auto" }} lang="de">
            Schwere Lasten.
            <br />
            <span className="text-[#00B4D8]">Luftweg.</span>
            <br />
            Präzise geliefert.
          </h1>

          <p className="text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
            Der fortschrittlichste Drohnen-Transportservice der Schweiz. Bis zu
            100 kg Nutzlast — direkt zum Einsatzort.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-[#00B4D8] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#0093b8] transition-colors text-lg"
            >
              JETZT BUCHEN <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#so-funktionierts"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/5 transition-colors text-lg"
            >
              Mehr erfahren ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. Trust Bar / Key Stats ── */}
      <section className="py-12 border-y border-white/10 bg-[#161C2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "🏔️", value: "100 kg", label: "Max. Nutzlast" },
              { icon: "📍", value: "CH & AT", label: "Einsatzgebiet" },
              { icon: "✅", value: "SORA", label: "Zertifizierter Betrieb" },
              { icon: "⚡", value: "15 min", label: "Ø Lieferzeit" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-[#00B4D8]">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. LASTENFLUG Service Overview ── */}
      <section id="dienste" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Unser Service</p>
            <h2 className="text-4xl font-bold mb-4">LASTENFLUG</h2>
            <p className="text-white/60 text-lg italic">Drohnen-Gütertransport für anspruchsvolle Umgebungen</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Mit dem <span className="text-white font-semibold">FlyCart 100</span> betreiben wir
                einen der leistungsfähigsten Transportdrohnen der Welt. 100 kg Nutzlast,
                präzise Steuerung, alle Wetterbedingungen meisterbar.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                Ob Baumaterial auf der Baustelle, medizinische Güter in abgelegenen Orten
                oder schwere Ausrüstung für alpine Projekte — LASTENFLUG bringt Ihre Ladung
                dorthin, wo kein LKW hinkommt.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Einmalige Lieferung",
                  desc: "Einzelauftrag — punktgenau, schnell, zuverlässig",
                  href: "/book?type=LASTENFLUG&subtype=EINMALIGE_LIEFERUNG",
                  cta: "Jetzt buchen",
                },
                {
                  title: "Langzeit-Einsatz",
                  desc: "Dauerbeauftragung für laufende Projekte mit festen Flugrouten",
                  href: "/book?type=LASTENFLUG&subtype=LANGZEIT_EINSATZ",
                  cta: "Angebot anfragen",
                },
              ].map((card) => (
                <div key={card.title} className="bg-[#161C2E] border border-white/10 rounded-2xl p-6 hover:border-[#00B4D8]/40 transition-colors group">
                  <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{card.desc}</p>
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-2 text-[#00B4D8] text-sm font-semibold group-hover:gap-3 transition-all"
                  >
                    {card.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA Banner ── */}
      <section className="py-20 bg-gradient-to-r from-[#00B4D8]/20 to-[#0093b8]/10 border-y border-[#00B4D8]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Bereit für Ihren ersten Drohnenflug?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Jetzt Angebot anfordern — in weniger als 3 Minuten.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-[#00B4D8] text-white font-bold px-10 py-4 rounded-xl hover:bg-[#0093b8] transition-colors text-lg"
          >
            JETZT BUCHEN <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── 6. How It Works (4 steps) ── */}
      <section id="so-funktionierts" className="py-24 bg-[#161C2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Ablauf</p>
            <h2 className="text-4xl font-bold">So einfach funktioniert LASTENFLUG</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#00B4D8]/20" />

            {[
              {
                step: "01",
                title: "Buchen",
                desc: "Konfigurieren Sie Ihren Auftrag online: Service-Typ, Datum, Gewicht, Standort.",
              },
              {
                step: "02",
                title: "Genehmigen",
                desc: "Unser Operatoren-Team prüft Ihre Anfrage, plant den Flug und holt Genehmigungen ein.",
              },
              {
                step: "03",
                title: "Fliegen",
                desc: "Der zertifizierte Pilot führt den Flug sicher und präzise durch. Live-Tracking inklusive.",
              },
              {
                step: "04",
                title: "Abrechnen",
                desc: "Nach dem Flug erhalten Sie automatisch Ihre Rechnung mit vollständigem Flugbericht.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-[#00B4D8] font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Use Cases (4 cards) ── */}
      <section id="anwendungen" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Anwendungen</p>
            <h2 className="text-4xl font-bold">Wo LASTENFLUG eingesetzt wird</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <Package className="w-6 h-6" />,
                title: "Bauwirtschaft & Infrastruktur",
                body: "Lieferung von Baumaterial, Werkzeug und Ausrüstung direkt auf die Baustelle — ohne Kraneinsatz, ohne Straßensperrung.",
                detail: "Typische Güter: Betonschalungen, Bewehrungsstahl, Werkzeugkisten, Schutzausrüstung",
              },
              {
                icon: <Mountain className="w-6 h-6" />,
                title: "Alpine Logistik & Bergprojekte",
                body: "Versorgung von Bauprojekten, Hütten, Forschungsstationen und Rettungsteams in unwegsamem Gelände.",
                detail: "Dort wo Fahrzeuge scheitern, fliegt LASTENFLUG.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Notfall & kritische Versorgung",
                body: "Schnelle Lieferung von medizinischen Gütern, Treibstoff, Lebensmitteln und Ausrüstung bei zeitkritischen Einsätzen.",
                detail: "Jede Minute zählt — Drohnen liefern ohne Stau.",
              },
              {
                icon: <Factory className="w-6 h-6" />,
                title: "Industrie, Energie & Remote-Standorte",
                body: "Ersatzteile, Instrumente und Materialien für Energieanlagen, Windparks, Sendemasten und Industriebauten in abgelegenen Gebieten.",
                detail: "",
              },
            ].map((card) => (
              <div key={card.title} className="bg-[#161C2E] border border-white/10 rounded-2xl p-8 hover:border-[#00B4D8]/30 transition-colors">
                <div className="w-12 h-12 bg-[#00B4D8]/10 rounded-xl flex items-center justify-center mb-6 text-[#00B4D8]">
                  {card.icon}
                </div>
                <h3 className="font-bold text-xl mb-3">{card.title}</h3>
                <p className="text-white/60 leading-relaxed mb-3">{card.body}</p>
                {card.detail && (
                  <p className="text-white/40 text-sm italic">{card.detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Safety & Compliance ── */}
      <section id="sicherheit" className="py-24 bg-[#161C2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Compliance</p>
              <h2 className="text-4xl font-bold mb-6">
                Sicherheit & Compliance —<br />auf höchstem Niveau
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Alle LASTENFLUG-Operationen werden gemäss den strengsten europäischen
                Drohnenvorschriften durchgeführt. Wir arbeiten eng mit dem{" "}
                <span className="text-white font-semibold">BAZL (Bundesamt für Zivilluftfahrt)</span>{" "}
                zusammen und halten alle SORA-Anforderungen ein.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "SORA-zertifizierter Betrieb",
                "BAZL-konform (Schweiz)",
                "Zertifizierte Fernpiloten",
                "Vollständige Flug- & Risikoanalyse",
                "Echtzeit-Luftraumüberwachung",
                "Versichert & haftpflichtgedeckt",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Franchise Teaser ── */}
      <section id="partner" className="py-24 bg-gradient-to-br from-[#0A0E1A] to-[#161C2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Franchise</p>
            <h2 className="text-4xl font-bold mb-6">Expandieren Sie mit uns</h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              airbase.one wird zur führenden Drohnen-Logistik-Franchise Europas. Wir suchen
              operative Partner in der Schweiz, Österreich und weiteren Märkten, die unsere
              Technologie, Marke und Prozesse lizenzieren möchten.
            </p>

            <div className="mb-10">
              <h3 className="font-bold text-white mb-4">Was wir bieten:</h3>
              <ul className="space-y-3">
                {[
                  "Vollständige technologische Infrastruktur (Buchungssystem, Dashboard, App)",
                  "Marken- und Marketingunterstützung",
                  "Regulatorisches Know-how & Lizenzunterstützung",
                  "Schulung & Zertifizierung für Piloten und Operatoren",
                  "Gemeinsame Wachstumsstrategie",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/70">
                    <span className="w-1.5 h-1.5 bg-[#00B4D8] rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-white/50 italic mb-8">
              Bereit, Marktführer in Ihrer Region zu werden?
            </p>

            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 border border-[#00B4D8] text-[#00B4D8] font-bold px-8 py-4 rounded-xl hover:bg-[#00B4D8] hover:text-white transition-colors"
            >
              FRANCHISE-ANFRAGE STELLEN <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 10. About / Swiss Quality ── */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Über uns</p>
          <h2 className="text-4xl font-bold mb-6">
            Schweizer Präzision. Für die Lüfte.
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-4">
            airbase.one ist ein Schweizer Drohnen-Logistikunternehmen mit dem Ziel, Gütertransport
            zu revolutionieren. Wir verbinden modernste Drohnentechnologie mit der Schweizer
            Tradition von Präzision, Zuverlässigkeit und Qualität.
          </p>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Wir glauben, dass die Zukunft der Logistik in der Luft liegt — und wir bauen sie heute.
          </p>
        </div>
      </section>

      {/* ── 11. Contact ── */}
      <section id="kontakt" className="py-24 bg-[#161C2E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#00B4D8] text-sm font-semibold uppercase tracking-widest mb-4">Kontakt</p>
            <h2 className="text-4xl font-bold mb-4">Kontakt aufnehmen</h2>
            <p className="text-white/60 text-lg">
              Haben Sie Fragen oder möchten Sie einen grossen Auftrag besprechen?
              Wir melden uns innerhalb von 24 Stunden.
            </p>
            <p className="text-white/50 mt-2 text-sm">
              E-Mail:{" "}
              <a href="mailto:info@airbase.one" className="text-[#00B4D8] hover:underline">
                info@airbase.one
              </a>{" "}
              · Standort: Schweiz
            </p>
          </div>

          <form
            action="mailto:info@airbase.one"
            method="get"
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  placeholder="Ihr Name"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Unternehmen</label>
                <input
                  type="text"
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4D8] transition-colors"
                  placeholder="Ihr Unternehmen"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">E-Mail *</label>
              <input
                type="email"
                required
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4D8] transition-colors"
                placeholder="ihre@email.ch"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Nachricht *</label>
              <textarea
                required
                rows={5}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00B4D8] transition-colors resize-none"
                placeholder="Wie können wir Ihnen helfen?"
              />
            </div>
            <div className="text-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#00B4D8] text-white font-bold px-10 py-4 rounded-xl hover:bg-[#0093b8] transition-colors"
              >
                NACHRICHT SENDEN <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── 12. Footer ── */}
      <footer className="bg-[#0A0E1A] border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div>
              <a href="#" className="font-bold text-xl tracking-tight block mb-3">
                AIRBASE<span className="text-[#00B4D8]">.ONE</span>
              </a>
              <p className="text-white/40 text-sm max-w-xs">
                Schweizer Drohnen-Logistik
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-3">Dienste</h4>
                <ul className="space-y-2 text-white/50">
                  <li><a href="#dienste" className="hover:text-white transition-colors">LASTENFLUG</a></li>
                  <li><Link href="/book" className="hover:text-white transition-colors">Jetzt buchen</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Meine Buchungen</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Sicherheit</h4>
                <ul className="space-y-2 text-white/50">
                  <li><a href="#sicherheit" className="hover:text-white transition-colors">Compliance</a></li>
                  <li><a href="#sicherheit" className="hover:text-white transition-colors">SORA & BAZL</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Franchise</h4>
                <ul className="space-y-2 text-white/50">
                  <li><a href="#partner" className="hover:text-white transition-colors">Partner werden</a></li>
                  <li><a href="#kontakt" className="hover:text-white transition-colors">Anfrage stellen</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Rechtliches</h4>
                <ul className="space-y-2 text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
            <span>© {new Date().getFullYear()} airbase.one — Alle Rechte vorbehalten.</span>
            <span>BAZL-konform · SORA-zertifiziert · Made in Switzerland 🇨🇭</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
