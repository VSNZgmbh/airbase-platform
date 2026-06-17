import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

/* ─── Brand Colors ─── */
const C = {
  accent: "#E30613",
  gold: "#B8860B",
  green: "#16A34A",
  text: "#1A1A2E",
  textSecondary: "#4A4A5A",
  textMuted: "#8A8A9A",
  bg: "#FFFFFF",
  bgAlt: "#F8F9FA",
  border: "#E8E8EE",
};

/* ─── Styles ─── */
const s = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: C.bg,
    padding: 40,
    fontFamily: "Helvetica",
    position: "relative",
  },
  pageAlt: {
    flexDirection: "column",
    backgroundColor: C.bgAlt,
    padding: 40,
    fontFamily: "Helvetica",
    position: "relative",
  },
  pageDark: {
    flexDirection: "column",
    backgroundColor: "#0A0A0A",
    padding: 40,
    fontFamily: "Helvetica",
    position: "relative",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: C.textMuted,
    fontFamily: "Helvetica",
  },
  slideLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  slideLabelNumber: {
    fontSize: 8,
    color: C.accent,
    borderWidth: 1,
    borderColor: C.accent + "40",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    letterSpacing: 1.5,
  },
  slideLabelText: {
    fontSize: 8,
    color: C.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    color: C.text,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  h2: {
    fontSize: 22,
    fontWeight: "bold",
    color: C.text,
    lineHeight: 1.2,
    marginBottom: 6,
  },
  h3: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 4,
  },
  accent: {
    color: C.accent,
  },
  gold: {
    color: C.gold,
  },
  greenText: {
    color: C.green,
  },
  subtitle: {
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  body: {
    fontSize: 9,
    color: C.textSecondary,
    lineHeight: 1.5,
  },
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: C.bg,
    marginBottom: 8,
  },
  cardAccent: {
    borderWidth: 1,
    borderColor: C.accent + "30",
    borderRadius: 8,
    padding: 12,
    backgroundColor: C.accent + "08",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },
  tag: {
    fontSize: 7,
    color: C.accent,
    backgroundColor: C.accent + "12",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bullet: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: C.textSecondary,
    lineHeight: 1.4,
  },
  barContainer: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 2,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: C.accent,
  },
  kpiLabel: {
    fontSize: 7,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
  },
  tableCell: {
    fontSize: 8,
    color: C.textSecondary,
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: "bold",
    color: C.text,
  },
  logo: {
    width: 100,
    height: "auto",
  },
});

/* ─── Footer Component ─── */
function PageFooter({ pageNum, total }: { pageNum: number; total: number }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>airBASE Aviation -- Confidential</Text>
      <Text style={s.footerText}>
        {pageNum} / {total}
      </Text>
    </View>
  );
}

/* ─── Slide Label ─── */
function SlideLabel({ number, text }: { number: string; text: string }) {
  return (
    <View style={s.slideLabel}>
      <Text style={s.slideLabelNumber}>{number}</Text>
      <Text style={s.slideLabelText}>{text}</Text>
    </View>
  );
}

/* ─── Bar Chart (simple) ─── */
function SimpleBar({
  value,
  maxValue,
  color,
  label,
  displayValue,
}: {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  displayValue: string;
}) {
  const pct = Math.max((value / maxValue) * 100, 2);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
      }}
    >
      <Text style={{ fontSize: 8, color: C.textSecondary, width: 80 }}>
        {label}
      </Text>
      <View style={[s.barContainer, { flex: 1 }]}>
        <View
          style={{
            height: 8,
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
      <Text
        style={{ fontSize: 7, fontWeight: "bold", color, width: 70, textAlign: "right" }}
      >
        {displayValue}
      </Text>
    </View>
  );
}

const TOTAL_PAGES = 15;

/* ═══════════════════════════════════════════════════════════════
   PITCHDECK PDF DOCUMENT
   ═══════════════════════════════════════════════════════════════ */
export function PitchdeckPDF({ logoSrc = "/airbase-logo-pdf.png" }: { logoSrc?: string } = {}) {
  return (
    <Document
      title="airBASE Aviation - Investor Pitch Deck 2026"
      author="airBASE Aviation"
      subject="Confidential Investor Pitch Deck"
    >
      {/* ═══ SLIDE 0: COVER ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Image
            src={logoSrc}
            style={{ width: 200, marginBottom: 24 }}
          />
          <Text
            style={{
              fontSize: 7,
              color: C.accent,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Confidential -- For Accredited Investors Only
          </Text>
          <Text style={[s.h1, { fontSize: 36, textAlign: "center" }]}>
            We Move Industries
          </Text>
          <Text
            style={[
              s.h1,
              { fontSize: 36, color: C.accent, textAlign: "center", marginBottom: 20 },
            ]}
          >
            Into the Sky.
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: C.textSecondary,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Helicopters . Tractors . Cranes . Trucks -- One Platform Replaces
            Them All . 100% Solar
          </Text>

          {/* Four Pillars */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {[
              { title: "Construction & Cranes", desc: "Precise material delivery" },
              { title: "Agriculture", desc: "Crop spraying & monitoring" },
              { title: "Emergency & Rescue", desc: "24/7 rapid deployment" },
              { title: "Logistics & Transport", desc: "Industrial cargo delivery" },
            ].map((p) => (
              <View
                key={p.title}
                style={{
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 8,
                  padding: 10,
                  width: 150,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    color: C.text,
                    textAlign: "center",
                    marginBottom: 2,
                  }}
                >
                  {p.title}
                </Text>
                <Text
                  style={{
                    fontSize: 7,
                    color: C.textMuted,
                    textAlign: "center",
                  }}
                >
                  {p.desc}
                </Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 9, color: C.textMuted }}>
            airbase.swiss . Seed Round CHF 1.5M . 2026
          </Text>
        </View>
        <PageFooter pageNum={1} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 1: DRONE HERO ═══ */}
      <Page size="A4" orientation="landscape" style={s.pageDark}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Image
            src={logoSrc}
            style={{ width: 120, marginBottom: 16, opacity: 0.9 }}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            One Platform.
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: C.accent,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Every Heavy Industry. Reinvented.
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            airBASE replaces helicopters, tractors, cranes, and trucks with
            heavy-lift drone swarms capable of transporting up to 600 kg per
            load -- at 90% lower cost and zero emissions. We serve construction,
            agriculture, logistics, and emergency rescue across Switzerland and
            Austria as a fully solar-powered B2B & B2C Drone-as-a-Service
            platform.
          </Text>
        </View>
        <View style={[s.footer, { bottom: 16 }]}>
          <Text style={[s.footerText, { color: "rgba(255,255,255,0.4)" }]}>
            airBASE Aviation -- Confidential
          </Text>
          <Text style={[s.footerText, { color: "rgba(255,255,255,0.4)" }]}>
            2 / {TOTAL_PAGES}
          </Text>
        </View>
      </Page>

      {/* ═══ SLIDE 2: THE PROBLEM ═══ */}
      <Page size="A4" orientation="landscape" style={s.pageAlt}>
        <SlideLabel number="01" text="THE PROBLEM" />
        <Text style={s.h2}>Helicopters. Tractors. Cranes.</Text>
        <Text style={[s.h2, { color: C.accent, marginBottom: 16 }]}>
          Billion-Dollar Machines. Last-Century Thinking.
        </Text>

        <View style={[s.row, { marginBottom: 12 }]}>
          {/* Helicopter */}
          <View style={[s.card, s.col]}>
            <Text style={[s.h3, { color: C.accent }]}>Helicopter Transport</Text>
            <Text style={{ fontSize: 7, color: C.textMuted, marginBottom: 6 }}>
              The status quo for mountain logistics
            </Text>
            {[
              { label: "CHF 7,000/h", sub: "Operating cost per hour" },
              { label: "~500 kg CO2/h", sub: "Jet-A1 fuel emissions" },
              { label: "100+ dB noise", sub: "Severe noise pollution" },
            ].map((item) => (
              <View key={item.label} style={s.bullet}>
                <View style={[s.bulletDot, { backgroundColor: C.accent }]} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 7, color: C.textMuted }}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
          {/* Crane */}
          <View style={[s.card, s.col]}>
            <Text style={[s.h3, { color: C.accent }]}>Construction Cranes</Text>
            <Text style={{ fontSize: 7, color: C.textMuted, marginBottom: 6 }}>
              Slow, expensive heavy lifting
            </Text>
            {[
              { label: "CHF 2,000-5,000/day", sub: "Rental + operator + fuel" },
              { label: "Hours to days setup", sub: "Transport, assembly, permits" },
              { label: "90+ dB noise", sub: "Disrupts neighborhoods" },
            ].map((item) => (
              <View key={item.label} style={s.bullet}>
                <View style={[s.bulletDot, { backgroundColor: C.accent }]} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 7, color: C.textMuted }}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
          {/* Tractor */}
          <View style={[s.card, s.col]}>
            <Text style={[s.h3, { color: C.accent }]}>Diesel Tractors</Text>
            <Text style={{ fontSize: 7, color: C.textMuted, marginBottom: 6 }}>
              Outdated agriculture machinery
            </Text>
            {[
              { label: "41 kg CO2/ha", sub: "Diesel emissions per hectare" },
              { label: "Soil compaction", sub: "Heavy machinery damages soil" },
              { label: "85+ dB noise", sub: "Diesel engine noise" },
            ].map((item) => (
              <View key={item.label} style={s.bullet}>
                <View style={[s.bulletDot, { backgroundColor: C.accent }]} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 7, color: C.textMuted }}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Cost comparison table */}
        <View style={s.card}>
          <Text
            style={{
              fontSize: 8,
              color: C.textMuted,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Standardized Daily Comparison -- Swiss Alpine Operations
          </Text>
          <View style={s.tableHeader}>
            <Text style={[s.tableCellBold, { width: 120 }]}>Method</Text>
            <Text style={[s.tableCellBold, { width: 100, textAlign: "right" }]}>
              Cost / Day
            </Text>
            <Text style={[s.tableCellBold, { width: 100, textAlign: "right" }]}>
              CO2 / Day
            </Text>
          </View>
          {[
            { method: "Helicopter", cost: "CHF 59,500", co2: "~4,250 kg", color: C.accent },
            { method: "Crane", cost: "CHF 4,000", co2: "~200 kg", color: C.accent },
            { method: "Heavy Truck", cost: "CHF 2,500", co2: "~150 kg", color: C.accent },
            { method: "AIRBASE Drone", cost: "CHF 650", co2: "0 kg", color: C.green },
          ].map((row) => (
            <View
              key={row.method}
              style={[
                s.tableRow,
                row.method === "AIRBASE Drone"
                  ? {
                      backgroundColor: C.accent + "08",
                      borderRadius: 4,
                      paddingHorizontal: 4,
                    }
                  : {},
              ]}
            >
              <Text
                style={[
                  s.tableCell,
                  {
                    width: 120,
                    fontWeight: row.method === "AIRBASE Drone" ? "bold" : "normal",
                    color:
                      row.method === "AIRBASE Drone" ? C.accent : C.textSecondary,
                  },
                ]}
              >
                {row.method}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "bold",
                  width: 100,
                  textAlign: "right",
                  color: row.color,
                }}
              >
                {row.cost}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "bold",
                  width: 100,
                  textAlign: "right",
                  color: row.method === "AIRBASE Drone" ? C.green : C.accent,
                }}
              >
                {row.co2}
              </Text>
            </View>
          ))}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 10,
              justifyContent: "center",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.accent }}>
                Up to 99%
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>
                Cost reduction vs. helicopter
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>
                100%
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>
                CO2 reduction (solar-powered)
              </Text>
            </View>
          </View>
        </View>
        <PageFooter pageNum={3} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 3: THE SOLUTION ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="02" text="THE SOLUTION" />
        <Text style={s.h2}>
          Optimizing Legacy Industries.{" "}
          <Text style={s.accent}>Creating New Ones.</Text>
        </Text>

        {/* Business Flow */}
        <View style={[s.cardAccent, { marginTop: 8 }]}>
          <Text
            style={{
              fontSize: 8,
              color: C.accent,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            How It Works -- B2B Drone Operations
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {[
              { label: "B2B Order", sub: "Client request" },
              { label: "AI Safety Check", sub: "SORA compliance" },
              { label: "Pilot Dispatched", sub: "Licensed crew" },
              { label: "Drone Delivers", sub: "85-200 kg cargo" },
              { label: "Invoice", sub: "Automated billing" },
            ].map((step, i) => (
              <View key={step.label} style={{ alignItems: "center", width: 100 }}>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    color: C.text,
                    textAlign: "center",
                  }}
                >
                  {i + 1}. {step.label}
                </Text>
                <Text
                  style={{
                    fontSize: 7,
                    color: C.textMuted,
                    textAlign: "center",
                  }}
                >
                  {step.sub}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Drone specs */}
        <View style={[s.row, { marginTop: 8 }]}>
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Workhorse
            </Text>
            <Text style={[s.h3]}>DJI FlyCart 100</Text>
            <Text style={s.body}>
              Up to 100 kg payload (single-battery) . 85 kg (dual-battery) . 12 km range
            </Text>
          </View>
          <View style={[s.card, s.col, { backgroundColor: C.accent + "06" }]}>
            <Text style={{ fontSize: 8, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Next-Gen [NEW]
            </Text>
            <Text style={[s.h3]}>DJI FlyCart 200</Text>
            <Text style={s.body}>
              200 kg payload . 10 km range (full load) . Swarm: 4 units = 600 kg . 7-min charge
            </Text>
          </View>
        </View>

        {/* Key stats */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          {[
            { value: "85-200 kg", label: "Payload capacity", sub: "FC100 + FC200" },
            { value: "-85%", label: "Cost vs traditional", sub: "Helicopter / tractor / crane" },
            { value: "<30 min", label: "Deployment time", sub: "Order to takeoff" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[s.card, { flex: 1, alignItems: "center" }]}
            >
              <Text style={[s.kpiValue, { fontSize: 18 }]}>{stat.value}</Text>
              <Text style={{ fontSize: 8, color: C.textSecondary, marginTop: 2 }}>
                {stat.label}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>{stat.sub}</Text>
            </View>
          ))}
        </View>
        <PageFooter pageNum={4} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 4: MARKET OPPORTUNITY ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="03" text="MARKET OPPORTUNITY" />
        <Text style={s.h2}>
          CHF 300M+ Swiss Market{" "}
          <Text style={s.accent}>-- Per Year. Ours to Take.</Text>
        </Text>
        <Text style={[s.subtitle, { maxWidth: 500 }]}>
          Real numbers. Real verticals. Switzerland alone represents a massive
          annual market.
        </Text>

        {/* Vertical breakdown */}
        <View style={{ marginTop: 4 }}>
          {[
            { vertical: "Helicopter Mountain Cargo", market: "CHF 130M", target2030: "60%", target2035: "80%" },
            { vertical: "Construction Logistics", market: "CHF 95M", target2030: "40%", target2035: "65%" },
            { vertical: "Agriculture", market: "CHF 45M", target2030: "50%", target2035: "75%" },
            { vertical: "Emergency & Rescue", market: "CHF 30M", target2030: "30%", target2035: "60%" },
          ].map((v) => (
            <View
              key={v.vertical}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 8,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: "bold", color: C.text, width: 180 }}>
                {v.vertical}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: C.accent, width: 100 }}>
                {v.market}
              </Text>
              <Text style={{ fontSize: 8, color: C.textMuted, width: 40 }}>/ year</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: C.gold, width: 50, textAlign: "center" }}>
                {v.target2030}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted, width: 60 }}>2030 target</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: C.green, width: 50, textAlign: "center" }}>
                {v.target2035}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>2035 vision</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16, alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
              Total Swiss Addressable Market
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: C.accent }}>
              CHF 300M+ / year
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
              Year-5 Target (SOM)
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: C.gold }}>
              CHF 24M ARR
            </Text>
          </View>
        </View>

        {/* Global TAM */}
        <View style={[s.row, { marginTop: 12 }]}>
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Global Drone Logistics Market ($B)
            </Text>
            {[
              { year: "2024", value: "$1.4B" },
              { year: "2026", value: "$3.2B" },
              { year: "2028", value: "$7.1B" },
              { year: "2030", value: "$16.1B" },
            ].map((d) => (
              <View key={d.year} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                <Text style={{ fontSize: 8, color: C.textMuted }}>{d.year}</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.accent }}>{d.value}</Text>
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: C.accent }}>$16.1B</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>Global by 2030</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: C.accent }}>50.1%</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>CAGR</Text>
              </View>
            </View>
          </View>
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Regulatory Tailwind -- Our Biggest Moat
            </Text>
            {[
              "LUC requires CHF 200K+ investment and 12-18 months -- massive barrier",
              "EASA U-Space framework advancing in CH -- first zone planned end 2026",
              "SORA risk-based approvals replace blanket bans -- first-mover window NOW",
              "Switzerland among 3 EU-adjacent countries with LUC pathway",
              "Highest labor costs in Europe = highest drone ROI per flight",
            ].map((text) => (
              <View key={text} style={s.bullet}>
                <View style={[s.bulletDot, { backgroundColor: C.gold }]} />
                <Text style={s.bulletText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
        <PageFooter pageNum={5} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 5: FINANCIAL PROJECTIONS ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="04" text="FINANCIAL PROJECTIONS" />
        <Text style={s.h2}>
          Built to Print Money <Text style={s.accent}>from Day One</Text>
        </Text>

        {/* Daily revenue by vertical */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {[
            { vertical: "Construction", revenue: "2,800", desc: "Material delivery" },
            { vertical: "Agriculture", revenue: "3,500", desc: "Precision spraying" },
            { vertical: "Mountain Delivery", revenue: "5,000", desc: "High-altitude cargo" },
          ].map((v) => (
            <View key={v.vertical} style={[s.card, { flex: 1, alignItems: "center" }]}>
              <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                {v.vertical}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: C.accent, marginVertical: 2 }}>
                CHF {v.revenue}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>per drone / day</Text>
              <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 2 }}>{v.desc}</Text>
            </View>
          ))}
        </View>

        {/* Operating metrics */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          <View style={[s.card, { flex: 1, alignItems: "center" }]}>
            <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase" }}>Daily operating cost</Text>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: C.text }}>~CHF 650 / drone</Text>
          </View>
          <View style={[s.card, { flex: 1, alignItems: "center" }]}>
            <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase" }}>Daily profit per drone</Text>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: C.accent }}>CHF 2,150 - 4,350</Text>
          </View>
          <View style={[s.card, { flex: 1, alignItems: "center" }]}>
            <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase" }}>Fleet scales linearly</Text>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: C.text }}>10 drones = CHF 50K+/day</Text>
          </View>
        </View>

        {/* Revenue projection - bar chart representation */}
        <View style={[s.card, { marginTop: 8 }]}>
          <Text style={{ fontSize: 8, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            6-Year Revenue Projection (CHF)
          </Text>
          {[
            { year: "2026", revenue: 0.12, label: "Pilot ops" },
            { year: "2027", revenue: 2.12, label: "4 hubs, 10 drones" },
            { year: "2028", revenue: 6.63, label: "Franchise launch" },
            { year: "2029", revenue: 11.8, label: "Expansion" },
            { year: "2030", revenue: 17.6, label: "Growth" },
            { year: "2031", revenue: 24.1, label: "Market lead" },
          ].map((yr) => (
            <View
              key={yr.year}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 8, color: C.textMuted, width: 30 }}>
                {yr.year}
              </Text>
              <View style={[s.barContainer, { flex: 1 }]}>
                <View
                  style={{
                    height: 8,
                    width: `${(yr.revenue / 24.1) * 100}%`,
                    backgroundColor: C.accent,
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: C.accent,
                  width: 55,
                  textAlign: "right",
                }}
              >
                CHF {yr.revenue}M
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted, width: 70 }}>
                {yr.label}
              </Text>
            </View>
          ))}
          <Text style={{ fontSize: 7, color: C.textMuted, fontStyle: "italic", marginTop: 6 }}>
            Projections are forward-looking estimates based on internal models. Not guarantees.
          </Text>
        </View>
        <PageFooter pageNum={6} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 6: THE ASK ═══ */}
      <Page size="A4" orientation="landscape" style={s.pageAlt}>
        <SlideLabel number="05" text="THE ASK" />
        <Text style={s.h2}>
          <Text style={s.accent}>CHF 1.5M</Text> to Own the Market Before It Exists
        </Text>

        <View style={[s.row, { marginTop: 12 }]}>
          {/* Fund allocation */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Use of Funds -- CHF 1.5M
            </Text>
            {[
              { name: "Fleet", amount: "CHF 550K", pct: "37%", color: C.accent },
              { name: "Hub Infrastructure", amount: "CHF 350K", pct: "23%", color: C.gold },
              { name: "Working Capital", amount: "CHF 220K", pct: "15%", color: C.textMuted },
              { name: "Sales & Marketing", amount: "CHF 150K", pct: "10%", color: C.green },
              { name: "LUC + Legal", amount: "CHF 90K", pct: "6%", color: "#8B5CF6" },
              { name: "Software & APIs", amount: "CHF 80K", pct: "5%", color: "#06B6D4" },
              { name: "Insurance", amount: "CHF 60K", pct: "4%", color: "#FF6B6B" },
            ].map((item) => (
              <View
                key={item.name}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: item.color,
                    }}
                  />
                  <Text style={{ fontSize: 9, color: C.textSecondary }}>
                    {item.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.text }}>
                  {item.amount} ({item.pct})
                </Text>
              </View>
            ))}

            <View style={s.divider} />

            <Text style={{ fontSize: 8, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Milestone Unlocks This Round
            </Text>
            {[
              "LUC certification achieved",
              "3 enterprise DaaS contracts signed",
              "Franchise program live (2 active partners)",
              "CHF 2.1M ARR target reached",
            ].map((text) => (
              <View key={text} style={s.bullet}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* Terms */}
          <View style={[s.col, { gap: 8 }]}>
            <View style={s.cardAccent}>
              <Text style={{ fontSize: 7, color: C.textMuted }}>Pre-Money Valuation</Text>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: C.accent }}>
                CHF 8.5M
              </Text>
            </View>
            <View style={[s.row, { gap: 8 }]}>
              <View style={[s.card, s.col]}>
                <Text style={{ fontSize: 7, color: C.textMuted }}>Instrument</Text>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: C.text }}>
                  Convertible Note
                </Text>
              </View>
              <View style={[s.card, s.col]}>
                <Text style={{ fontSize: 7, color: C.textMuted }}>Round</Text>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: C.text }}>
                  Seed
                </Text>
              </View>
            </View>
            <View style={[s.card, { backgroundColor: C.accent + "06" }]}>
              <Text style={{ fontSize: 8, color: C.accent, fontWeight: "bold", marginBottom: 4 }}>
                Investment Calculator (CHF 250K Example)
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: C.textSecondary }}>Equity stake</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.accent }}>~2.9%</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: C.textSecondary }}>Interest rate</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.green }}>6% p.a.</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: C.textSecondary }}>Conversion discount</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.gold }}>20%</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 8, color: C.textSecondary }}>5-Yr total note value</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.gold }}>CHF 325K</Text>
              </View>
            </View>
          </View>
        </View>
        <PageFooter pageNum={7} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 7: WHY 1.5M ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="06" text="WHY CHF 1.5M" />
        <Text style={s.h2}>
          Speed is our Moat: <Text style={s.accent}>200K Catalyst</Text> vs.{" "}
          <Text style={s.accent}>1.5M Market Dominance</Text>
        </Text>
        <Text style={s.subtitle}>
          Capital is speed. Speed is the moat. Here is why we raise CHF 1.5M.
        </Text>

        <View style={[s.row, { marginTop: 4 }]}>
          {/* Catalyst */}
          <View style={[s.card, s.col]}>
            <View style={{ height: 3, backgroundColor: C.gold, borderRadius: 2, marginBottom: 8 }} />
            <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Step 1</Text>
            <Text style={[s.h3, { marginBottom: 6 }]}>The Catalyst -- CHF 200K</Text>
            <Text style={[s.body, { marginBottom: 6 }]}>The perfect entry ticket.</Text>
            {["Immediate start of operations", "Marketing campaigns & process testing", "Finalization of first software version (MVP)"].map(
              (text) => (
                <View key={text} style={s.bullet}>
                  <View style={[s.bulletDot, { backgroundColor: C.gold }]} />
                  <Text style={s.bulletText}>{text}</Text>
                </View>
              ),
            )}
            <View style={{ backgroundColor: C.gold + "12", borderRadius: 6, padding: 8, marginTop: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 7, color: C.gold, letterSpacing: 1, textTransform: "uppercase" }}>Status Outcome</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: C.text }}>Active as a local service provider</Text>
            </View>
          </View>
          {/* Dominance */}
          <View style={[s.card, s.col, { borderColor: C.accent + "30" }]}>
            <View style={{ height: 3, backgroundColor: C.accent, borderRadius: 2, marginBottom: 8 }} />
            <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Step 2</Text>
            <Text style={[s.h3, { marginBottom: 6 }]}>Market Dominance -- CHF 1.5M</Text>
            <Text style={[s.body, { marginBottom: 6 }]}>Capital as a weapon to occupy the market.</Text>
            {[
              "Fleet redundancy for large enterprise contracts",
              "LUC certifications (heavy transport & autonomy)",
              "DaaS infrastructure -- Drone-as-a-Service at scale",
            ].map((text) => (
              <View key={text} style={s.bullet}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{text}</Text>
              </View>
            ))}
            <View style={{ backgroundColor: C.accent + "10", borderRadius: 6, padding: 8, marginTop: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 7, color: C.accent, letterSpacing: 1, textTransform: "uppercase" }}>Status Outcome</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: C.text }}>Dominate the market & scale Europe-wide</Text>
            </View>
          </View>
        </View>


        <PageFooter pageNum={8} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 8: THE PLATFORM ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="07" text="THE PLATFORM" />
        <Text style={s.h2}>
          airBASE Platform --{" "}
          <Text style={s.accent}>The Brain Behind the Fleet</Text>
        </Text>
        <Text style={[s.subtitle, { maxWidth: 500 }]}>
          A fully integrated, AI-powered operations platform managing every
          aspect of commercial drone operations.
        </Text>

        <View style={[s.row, { marginTop: 8 }]}>
          {[
            {
              title: "Admin Dashboard",
              color: C.accent,
              features: [
                "Fleet management & health monitoring",
                "Revenue analytics & KPIs",
                "Regulatory compliance tracking",
                "Franchise partner oversight",
              ],
            },
            {
              title: "Pilot App",
              color: C.green,
              features: [
                "Real-time mission assignments",
                "Pre-flight checklists & NOTAM",
                "Flight logging & telemetry",
                "Weather & airspace alerts",
              ],
            },
            {
              title: "Customer Portal",
              color: C.gold,
              features: [
                "Self-service booking & scheduling",
                "Live delivery tracking",
                "Automated invoicing",
                "Service history & reports",
              ],
            },
          ].map((view) => (
            <View key={view.title} style={[s.card, s.col]}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  color: view.color,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {view.title}
              </Text>
              {view.features.map((f) => (
                <View key={f} style={s.bullet}>
                  <View style={[s.bulletDot, { backgroundColor: view.color }]} />
                  <Text style={s.bulletText}>{f}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* AI capabilities */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
          {[
            { label: "AI-Powered Dispatch", desc: "Autonomous mission planning" },
            { label: "EASA/BAZL Compliant", desc: "Built-in regulatory framework" },
            { label: "Real-Time Telemetry", desc: "Live fleet GPS & battery data" },
            { label: "Franchise-Ready", desc: "Multi-tenant architecture" },
          ].map((cap) => (
            <View
              key={cap.label}
              style={{
                flex: 1,
                backgroundColor: C.accent + "08",
                borderWidth: 1,
                borderColor: C.accent + "20",
                borderRadius: 6,
                padding: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: "bold",
                  color: C.accent,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                {cap.label}
              </Text>
              <Text style={{ fontSize: 7, color: C.textSecondary, textAlign: "center", marginTop: 2 }}>
                {cap.desc}
              </Text>
            </View>
          ))}
        </View>

        <View style={[s.cardAccent, { marginTop: 10, alignItems: "center" }]}>
          <Text style={{ fontSize: 8, color: C.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            See It In Action
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: C.text }}>
            Our platform is live. Try it yourself.
          </Text>
          <Text style={{ fontSize: 9, color: C.accent, marginTop: 4 }}>
            airbase-platform.vercel.app/admin
          </Text>
        </View>
        <PageFooter pageNum={9} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 9: COMPETITIVE EDGE ═══ */}
      <Page size="A4" orientation="landscape" style={s.pageAlt}>
        <SlideLabel number="08" text="COMPETITIVE EDGE" />
        <Text style={s.h2}>
          Our Real Moat:{" "}
          <Text style={s.gold}>LUC + AI + Franchise + Network</Text>
        </Text>

        <View style={[s.row, { marginTop: 10 }]}>
          {[
            {
              title: "LUC -- Drone Airline",
              sub: "Self-Authorized Flights",
              color: C.gold,
              bgColor: C.gold + "10",
              points: [
                "15 years experience + proprietary software = ability to achieve LUC",
                "Self-authorize flights -- no per-mission approvals",
                "LUC makes the franchise model sellable and scalable",
                "Massive regulatory moat -- near-impossible to replicate",
              ],
            },
            {
              title: "AI-Powered Operations",
              sub: "Already valued at CHF 1 Million",
              color: C.accent,
              bgColor: C.accent + "08",
              points: [
                "Entire company operates autonomously via AI",
                "Automated dispatch, compliance & invoicing",
                "Scales without linear headcount growth",
                "Data flywheel: every flight improves the system",
              ],
            },
            {
              title: "Franchise Model",
              sub: "From 1 to 100 Regions",
              color: C.gold,
              bgColor: C.gold + "10",
              points: [
                "Rapid geographic scaling without capital drag",
                "Partners invest locally, we provide platform + LUC sub-licence",
                "Recurring franchise royalties (12%) + setup fees",
                "Proven playbook: from 1 to 100 regions fast",
              ],
            },
            {
              title: "Massive Network",
              sub: "Instant Market Access",
              color: C.green,
              bgColor: C.green + "10",
              points: [
                "Marketing agency + VSNZ event label -- worldwide",
                "Know all major Swiss companies -- immediate B2B access",
                "Day-one marketing: TV, social media, industry events",
                "Not a cold start -- WE are the center of the market",
              ],
            },
          ].map((moat) => (
            <View
              key={moat.title}
              style={{
                flex: 1,
                backgroundColor: moat.bgColor,
                borderWidth: 1,
                borderColor: moat.color + "20",
                borderRadius: 8,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 8, fontWeight: "bold", color: moat.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                {moat.title}
              </Text>
              <Text style={{ fontSize: 7, fontWeight: "bold", color: moat.color, marginBottom: 6 }}>
                {moat.sub}
              </Text>
              {moat.points.map((text) => (
                <View key={text} style={s.bullet}>
                  <View style={[s.bulletDot, { backgroundColor: moat.color }]} />
                  <Text style={{ fontSize: 7, color: C.textSecondary, lineHeight: 1.4 }}>
                    {text}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <PageFooter pageNum={10} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 10: BUSINESS MODEL ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="09" text="BUSINESS MODEL" />
        <Text style={s.h2}>
          Two Core Revenue Engines.{" "}
          <Text style={s.accent}>Built to Scale.</Text>
        </Text>

        <View style={[s.row, { marginTop: 12 }]}>
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 9, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
              DaaS -- Primary Revenue
            </Text>
            <Text style={[s.h3, { marginBottom: 4 }]}>Drone-as-a-Service</Text>
            <Text style={[s.body, { marginBottom: 6 }]}>
              We operate the drones. Construction, agriculture, infrastructure,
              emergency -- B2B contracts across all four verticals.
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: C.accent }}>~65% gross margin</Text>
            <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 2 }}>
              Per-flight fee + SLA retainer
            </Text>
          </View>
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 9, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
              Franchise -- Scale Engine
            </Text>
            <Text style={[s.h3, { marginBottom: 4 }]}>Franchise Licensing</Text>
            <Text style={[s.body, { marginBottom: 6 }]}>
              Partners acquire AIRBASE-branded drone kits + full service
              portfolio + LUC sub-licence. Our software + permits are the moat.
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "bold", color: C.green }}>
              CHF 85K setup + 12% royalty
            </Text>
            <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 2 }}>
              Recurring royalties + setup fees
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 40, marginTop: 16 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 7, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
              Projected Year 3 Revenue Mix
            </Text>
            <View style={{ flexDirection: "row", gap: 24 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: C.accent }}>65%</Text>
                <Text style={{ fontSize: 8, color: C.textMuted }}>DaaS</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: C.green }}>35%</Text>
                <Text style={{ fontSize: 8, color: C.textMuted }}>Franchise</Text>
              </View>
            </View>
          </View>
        </View>
        <PageFooter pageNum={11} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 11: TRACTION & TEAM ═══ */}
      <Page size="A4" orientation="landscape" style={s.pageAlt}>
        <SlideLabel number="10" text="TRACTION & TEAM" />
        <Text style={s.h2}>
          Team Ready. Platform Built.{" "}
          <Text style={s.greenText}>Operations Starting Summer 2026.</Text>
        </Text>

        <View style={[s.row, { marginTop: 8 }]}>
          {/* Timeline */}
          <View style={[s.col, { marginRight: 8 }]}>
            <Text style={{ fontSize: 8, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Milestones
            </Text>
            {[
              { date: "Q1 2026", text: "Company incorporated in Switzerland", done: true },
              { date: "Q1 2026", text: "AIRBASE platform v1.0 built", done: true },
              { date: "Q1 2026", text: "SORA / BAZL applications filed", done: true },
              { date: "Q2 2026", text: "4 licensed drone pilots secured", done: true },
              { date: "Summer 26*", text: "First commercial flights", done: false },
              { date: "Q3-Q4 26*", text: "Fleet expansion & first DaaS contracts", done: false },
              { date: "Q1 2027*", text: "FlyCart 200 fleet expansion", done: false },
              { date: "Q2-Q3 27*", text: "Franchise pilot program (2 partners)", done: false },
              { date: "Late 2027*", text: "LUC certification expected", done: false },
            ].map((m, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                  borderRadius: 4,
                  backgroundColor: m.done ? C.green + "10" : "transparent",
                  marginBottom: 2,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: m.done ? C.green : C.textMuted + "40",
                  }}
                />
                <Text style={{ fontSize: 7, color: m.done ? C.green : C.textMuted, width: 55 }}>
                  {m.date}
                </Text>
                <Text style={{ fontSize: 8, color: C.textSecondary }}>{m.text}</Text>
              </View>
            ))}
            <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 4 }}>
              * Projected -- subject to regulatory timelines
            </Text>
          </View>

          {/* Team */}
          <View style={s.col}>
            <Text style={{ fontSize: 8, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Leadership
            </Text>
            {[
              {
                name: "Benjamin Rubi",
                role: "Founder & CEO",
                desc: "15+ years drone industry. Marketing agency CEO. VSNZ founder.",
              },
              {
                name: "Chris Jon Graf",
                role: "CTO & Head of AI",
                desc: "Robotics & AI engineering. Architecting the AI-powered platform.",
              },
              {
                name: "Vertical Masters",
                role: "Training & LUC Partner",
                desc: "Strategic partner for LUC certification and pilot training.",
              },
            ].map((p) => (
              <View key={p.name} style={[s.card, { marginBottom: 4 }]}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: C.text }}>
                  {p.name}
                </Text>
                <Text style={{ fontSize: 7, color: C.accent, letterSpacing: 1, textTransform: "uppercase" }}>
                  {p.role}
                </Text>
                <Text style={{ fontSize: 8, color: C.textSecondary, marginTop: 2 }}>
                  {p.desc}
                </Text>
              </View>
            ))}

            <View style={{ backgroundColor: C.green + "10", borderRadius: 6, padding: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 8, fontWeight: "bold", color: C.green, marginBottom: 2 }}>
                Zero Burn on Salaries -- Team is Self-Funded
              </Text>
              <Text style={{ fontSize: 7, color: C.textSecondary }}>
                Team paid by existing companies. No burn on salaries from
                investor money.
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>12</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>Team Members</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>4</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>Licensed Pilots</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: C.accent }}>+5</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>In Pipeline</Text>
              </View>
            </View>
          </View>
        </View>
        <PageFooter pageNum={12} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 12: SUSTAINABILITY ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="11" text="SUSTAINABILITY" />
        <Text style={[s.h2, { color: C.green }]}>
          Zero Emissions. Zero Compromise.{" "}
          <Text style={{ color: C.text }}>100% Solar-Powered.</Text>
        </Text>

        <View style={[s.row, { marginTop: 10 }]}>
          {/* Transport comparison */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Transport & Construction
            </Text>
            <SimpleBar label="Helicopter" value={68} maxValue={68} color={C.accent} displayValue="~68 kg CO2/h" />
            <SimpleBar label="AIRBASE Drone" value={0.1} maxValue={68} color={C.green} displayValue="0 g CO2" />
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>100%</Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>emission reduction per flight</Text>
            </View>
          </View>
          {/* Agriculture comparison */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Agriculture
            </Text>
            <SimpleBar label="Diesel Tractor" value={41.3} maxValue={41.3} color={C.accent} displayValue="41.3 kg CO2/ha" />
            <SimpleBar label="AIRBASE Drone" value={0.1} maxValue={41.3} color={C.green} displayValue="0 kg CO2/ha" />
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>100%</Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>emission reduction per hectare</Text>
            </View>
          </View>
          {/* Noise */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Noise Comparison
            </Text>
            <SimpleBar label="Helicopter" value={100} maxValue={100} color={C.accent} displayValue="100+ dB" />
            <SimpleBar label="AIRBASE Drone" value={65} maxValue={100} color={C.green} displayValue="~65 dB" />
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>35+ dB</Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>quieter than helicopters</Text>
            </View>
          </View>
        </View>

        {/* Solar KPIs */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {[
            { value: "0g", label: "Direct CO2 per flight" },
            { value: "100%", label: "Solar-powered fleet" },
            { value: "100%", label: "Solar transport vehicle" },
            { value: "~95%", label: "Less energy vs diesel" },
          ].map((kpi) => (
            <View
              key={kpi.label}
              style={{
                flex: 1,
                backgroundColor: C.green + "10",
                borderRadius: 6,
                padding: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", color: C.green }}>
                {kpi.value}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted, textAlign: "center" }}>
                {kpi.label}
              </Text>
            </View>
          ))}
        </View>
        <PageFooter pageNum={13} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 13: INDUSTRY VERTICALS ═══ */}
      <Page size="A4" orientation="landscape" style={s.pageAlt}>
        <SlideLabel number="12" text="INDUSTRY VERTICALS" />
        <Text style={s.h2}>
          Not One Vertical.{" "}
          <Text style={s.accent}>An Entire Ecosystem.</Text>
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {[
            {
              title: "Construction",
              color: C.accent,
              desc: "Precise material delivery across large construction sites from A to B. Ideal where cranes cannot be placed.",
              steps: ["Order materials", "Drone lifts 85-200 kg", "Site-to-site delivery"],
            },
            {
              title: "Agriculture",
              color: C.gold,
              desc: "Crop spraying, seeding, monitoring. Zero soil compaction, 60% less chemical use.",
              steps: ["Field scan", "Precision spray", "60% less chemicals"],
            },
            {
              title: "Infrastructure",
              color: C.green,
              desc: "Thermal imaging, powerline inspection, infrastructure maintenance at scale.",
              steps: ["Thermal imaging", "Powerline inspect", "Maintenance plan"],
            },
            {
              title: "Emergency",
              color: C.accent,
              desc: "Medical supply, rescue support. 24/7 ready, rapid deployment anywhere.",
              steps: ["Alert received", "Rapid deploy", "Lives saved"],
            },
          ].map((v) => (
            <View
              key={v.title}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 8,
                padding: 12,
                backgroundColor: C.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: v.color,
                  marginBottom: 6,
                }}
              >
                {v.title}
              </Text>
              <Text style={{ fontSize: 8, color: C.textSecondary, marginBottom: 8, lineHeight: 1.4 }}>
                {v.desc}
              </Text>
              {v.steps.map((step, i) => (
                <View
                  key={step}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: v.color + "08",
                    borderRadius: 4,
                    padding: 4,
                    marginBottom: 3,
                  }}
                >
                  <Text style={{ fontSize: 7, fontWeight: "bold", color: v.color }}>
                    {i + 1}.
                  </Text>
                  <Text style={{ fontSize: 7, color: C.textSecondary }}>{step}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <PageFooter pageNum={14} total={TOTAL_PAGES} />
      </Page>

      {/* ═══ SLIDE 14: VISION ═══ */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <SlideLabel number="13" text="VISION" />
        <Text style={s.h2}>
          We are Not Entering a Market.{" "}
          <Text style={s.accent}>We are Building One.</Text>
        </Text>

        <View style={{ marginTop: 16 }}>
          {[
            { year: "2026", text: "Certified and operational. AIRBASE is Switzerland's most capable heavy-lift drone operator." },
            { year: "2027", text: "Platform licensed to 10+ operators. AIRBASE becomes infrastructure, not just a service." },
            { year: "2028", text: "Cross-border expansion. AIRBASE is the EASA-compliant standard for EU heavy-lift drone operations." },
          ].map((item) => (
            <View
              key={item.year}
              style={{
                flexDirection: "row",
                gap: 10,
                padding: 10,
                borderRadius: 6,
                backgroundColor: C.accent + "08",
                borderWidth: 1,
                borderColor: C.accent + "20",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "bold", color: C.accent }}>
                {item.year}
              </Text>
              <Text style={{ fontSize: 10, color: C.textSecondary, flex: 1 }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Vision metrics */}
        <View
          style={{
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
            backgroundColor: C.gold + "10",
            borderWidth: 1,
            borderColor: C.gold + "20",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 8, color: C.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            Shaping the Future of Multiple Industries
          </Text>
          <View style={{ flexDirection: "row", gap: 40, justifyContent: "center" }}>
            {[
              { value: "10+", label: "Operators Licensed" },
              { value: "5", label: "Countries" },
              { value: "CHF 24M", label: "ARR Target" },
              { value: "75%+", label: "Gross Margin" },
            ].map((m) => (
              <View key={m.label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: C.text }}>
                  {m.value}
                </Text>
                <Text style={{ fontSize: 8, color: C.textMuted }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Closing tagline */}
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: C.accent }}>
            The Future Does Not Wait. Neither Do We.
          </Text>
          <Text style={{ fontSize: 8, color: C.textMuted, marginTop: 12 }}>
            airbase.swiss -- Confidential
          </Text>
        </View>
        <PageFooter pageNum={15} total={TOTAL_PAGES} />
      </Page>
    </Document>
  );
}
