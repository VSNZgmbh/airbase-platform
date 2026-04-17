import Link from "next/link";
import { ArrowRight, Package, Clock, MapPin, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Airbase</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900 text-sm">
                Leistungen
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm">
                So funktioniert es
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm">
                Preise
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Anmelden
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Jetzt buchen
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Jetzt verfügbar in der Schweiz
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
              Drohnentransport.
              <br />
              <span className="text-brand-300">Automatisch.</span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-xl">
              Buchen Sie in 3 Minuten Ihren LASTENFLUG mit dem FlyCart 100. Bis
              100 kg Nutzlast, bis 100 km Reichweite, automatische
              Genehmigungsabwicklung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors text-lg"
              >
                Flug buchen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg"
              >
                Mehr erfahren
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100 kg", label: "Max. Nutzlast" },
              { value: "100 km", label: "Max. Reichweite" },
              { value: "75 km/h", label: "Reisegeschwindigkeit" },
              { value: "8.1%", label: "MwSt. inklusive" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-brand-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Unsere Leistungen
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Professioneller Drohnentransport für Unternehmen und Privatpersonen
              in der Schweiz und Österreich.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                LASTENFLUG — Einmalige Lieferung
              </h3>
              <p className="text-gray-600 mb-6">
                Einmalige Frachttransporte bis 100 kg. Ideal für dringende
                Lieferungen, Remote-Standorte oder schwer zugängliche Gebiete.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  Bis 100 kg Nutzlast (FlyCart 100)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  GPS-genaue Zustellung
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  Automatische BAZL-Genehmigung
                </li>
              </ul>
              <Link
                href="/book?type=LASTENFLUG&subtype=EINMALIGE_LIEFERUNG"
                className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700"
              >
                Jetzt buchen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                LASTENFLUG — Langzeit-Einsatz
              </h3>
              <p className="text-gray-600 mb-6">
                Wiederkehrende Transporte für Baustellen, Events oder
                Industriebetriebe. Rahmenverträge mit Mengenrabatten verfügbar.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  Langzeit-Genehmigungen
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  Dedizierter Operator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  Volumenrabatte ab 10 Flügen
                </li>
              </ul>
              <Link
                href="/book?type=LASTENFLUG&subtype=LANGZEIT_EINSATZ"
                className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700"
              >
                Angebot anfragen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              So einfach buchen Sie
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <MapPin className="w-6 h-6 text-brand-600" />,
                title: "Route & Details",
                desc: "Geben Sie Abflug- und Lieferort ein, wählen Sie Datum und Nutzlast.",
              },
              {
                step: "02",
                icon: <Package className="w-6 h-6 text-brand-600" />,
                title: "Preis erhalten",
                desc: "Unser Preisrechner zeigt sofort den Preis inkl. MwSt. und Optionen.",
              },
              {
                step: "03",
                icon: <Shield className="w-6 h-6 text-brand-600" />,
                title: "Bestätigen & fertig",
                desc: "Buchen Sie online. Wir kümmern uns um Genehmigungen und Logistik.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-6xl font-bold text-brand-100 mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transparente Preise
            </h2>
            <p className="text-gray-600">
              Keine Überraschungen — Preis vor Buchung bekannt.
            </p>
          </div>
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8">
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Grundtarif</span>
                <span className="font-semibold">CHF 8.50 / km</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Gewichtszuschlag (über 20 kg)</span>
                <span className="font-semibold">CHF 0.50 / kg</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Abflug ab Airbase Hub</span>
                <span className="font-semibold">+ CHF 25.00</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Individueller Abflugort</span>
                <span className="font-semibold">+ CHF 2.00 / km</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Mindestbuchungswert</span>
                <span className="font-semibold">CHF 120.00</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">MwSt.</span>
                <span className="font-semibold">8.1%</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Preis berechnen & buchen
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-bold text-xl text-white">Airbase</span>
              </div>
              <p className="text-sm max-w-xs">
                Automatisierter Drohnentransport in der Schweiz. BAZL-zugelassen.
                SORA-konform.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-3">Leistungen</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/book" className="hover:text-white">
                      LASTENFLUG buchen
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-white">
                      Meine Buchungen
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Unternehmen</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white">
                      Über uns
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Kontakt
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Rechtliches</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white">
                      AGB
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Datenschutz
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Impressum
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} Airbase. Alle Rechte vorbehalten.
            airbase.one
          </div>
        </div>
      </footer>
    </main>
  );
}
