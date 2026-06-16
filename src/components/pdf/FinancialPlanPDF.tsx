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
  red: "#E30613",
  text: "#1A1A2E",
  textSecondary: "#4A4A5A",
  textMuted: "#8A8A9A",
  bg: "#FFFFFF",
  bgAlt: "#F8F9FA",
  border: "#E8E8EE",
};

const s = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: C.bg,
    padding: 36,
    fontFamily: "Helvetica",
    position: "relative",
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: C.textMuted },
  sectionNum: {
    fontSize: 8,
    color: C.accent,
    borderWidth: 1,
    borderColor: C.accent + "40",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    letterSpacing: 1.5,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  h1: { fontSize: 24, fontWeight: "bold", color: C.text, marginBottom: 4 },
  h2: { fontSize: 16, fontWeight: "bold", color: C.text, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: "bold", color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 9, color: C.textMuted, marginBottom: 12 },
  body: { fontSize: 8, color: C.textSecondary, lineHeight: 1.5 },
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: C.bg,
    marginBottom: 6,
  },
  row: { flexDirection: "row", gap: 6 },
  col: { flex: 1 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  // Table styles
  tHead: {
    flexDirection: "row",
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tCell: { fontSize: 7, color: C.textSecondary },
  tCellBold: { fontSize: 7, fontWeight: "bold", color: C.text },
  tCellAccent: { fontSize: 7, fontWeight: "bold", color: C.accent },
  tCellGreen: { fontSize: 7, fontWeight: "bold", color: C.green },
  tCellRed: { fontSize: 7, fontWeight: "bold", color: C.red },
  kpiBox: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    flex: 1,
  },
  kpiValue: { fontSize: 14, fontWeight: "bold", color: C.accent },
  kpiLabel: {
    fontSize: 6,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
    textAlign: "center",
  },
  bullet: { flexDirection: "row", gap: 4, marginBottom: 3 },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.accent,
    marginTop: 3,
  },
  bulletText: { flex: 1, fontSize: 8, color: C.textSecondary, lineHeight: 1.4 },
  barBg: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 2,
  },
});

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>airBASE Aviation -- Confidential</Text>
      <Text style={s.footerText}>
        {page} / {total}
      </Text>
    </View>
  );
}

const TOTAL = 11;

export function FinancialPlanPDF() {
  return (
    <Document
      title="airBASE Aviation - Financial Plan 2026"
      author="airBASE Aviation"
      subject="Confidential Financial Plan"
    >
      {/* ═══ COVER PAGE ═══ */}
      <Page
        size="A4"
        style={{
          flexDirection: "column",
          backgroundColor: "#1A1A2E",
          padding: 40,
          fontFamily: "Helvetica",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          src="/airbase-logo-transparent.png"
          style={{ width: 140, height: "auto", marginBottom: 24, opacity: 0.9 }}
        />
        <Text
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Investor-Grade Financial Projections
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Financial Plan
        </Text>
        <Text
          style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}
        >
          Confidential -- June 2026
        </Text>

        {/* Highlight KPIs */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            { label: "Year 6 Revenue", value: "CHF 22.2M", sub: "73% EBITDA margin" },
            { label: "Contribution Margin", value: "80.8%", sub: "Per drone unit" },
            { label: "Break-Even", value: "Month 5", sub: "Operational" },
            { label: "6-Yr Cumulative", value: "+CHF 35.2M", sub: "Cash flow" },
          ].map((kpi) => (
            <View
              key={kpi.label}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: 10,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#FFFFFF" }}>
                {kpi.value}
              </Text>
              <Text
                style={{
                  fontSize: 6,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginTop: 2,
                }}
              >
                {kpi.label}
              </Text>
              <Text style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
                {kpi.sub}
              </Text>
            </View>
          ))}
        </View>

        <View style={[s.footer, { bottom: 20 }]}>
          <Text style={[s.footerText, { color: "rgba(255,255,255,0.3)" }]}>
            airBASE Aviation -- Confidential
          </Text>
          <Text style={[s.footerText, { color: "rgba(255,255,255,0.3)" }]}>
            1 / {TOTAL}
          </Text>
        </View>
      </Page>

      {/* ═══ TABLE OF CONTENTS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Table of Contents</Text>
        <View style={s.divider} />
        {[
          { num: "01", title: "Unit Economics", sub: "Per drone P&L -- CHF 630K revenue, 81% margin" },
          { num: "02", title: "6-Year P&L", sub: "CHF 315K to CHF 22.2M with 73% EBITDA margin" },
          { num: "03", title: "Break-Even Analysis", sub: "Operational break-even Month 5-6" },
          { num: "04", title: "Cash Flow", sub: "-CHF 203K to +CHF 35.2M cumulative" },
          { num: "05", title: "Investor ROI", sub: "Convertible note returns by scenario" },
          { num: "06", title: "Franchise Economics", sub: "Partner P&L + HQ recurring revenue" },
          { num: "07", title: "Fleet Growth", sub: "2 to 5 own drones + 35 franchise partners over 6 years" },
          { num: "08", title: "Platform GMV", sub: "CHF 95.5M total ecosystem value" },
          { num: "09", title: "Sensitivity Analysis", sub: "Revenue sensitivity grid + risk factors" },
        ].map((item) => (
          <View
            key={item.num}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold", color: C.accent, width: 20 }}>
              {item.num}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: C.text }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>{item.sub}</Text>
            </View>
          </View>
        ))}
        <Footer page={2} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 1: UNIT ECONOMICS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>01</Text>
        <Text style={s.h2}>Unit Economics</Text>
        <Text style={s.subtitle}>
          Per drone profit & loss -- CHF 630K revenue, 80.8% contribution margin
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Revenue / Drone", value: "CHF 630K", sub: "180 days x CHF 3,500/day" },
            { label: "Contribution Margin", value: "CHF 509K", sub: "80.8% margin" },
            { label: "CAPEX / Drone", value: "CHF 49K", sub: "FC200 full set (base)" },
            { label: "Annual OPEX", value: "CHF 12.9K", sub: "Maint + insurance + battery" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={s.kpiValue}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 1 }}>
                {kpi.sub}
              </Text>
            </View>
          ))}
        </View>

        {/* CAPEX Table */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Capital Expenditure (CAPEX)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 140 }]}>Item</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Conservative</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Base</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Optimistic</Text>
          </View>
          {[
            ["Drone (FC200, full set)", "CHF 45,000", "CHF 40,000", "CHF 35,000"],
            ["Extra battery sets (3-4x)", "CHF 10,000", "CHF 9,000", "CHF 8,000"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { width: 140 }]}>{row[0]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[2]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[3]}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { width: 140 }]}>Total per drone</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 55,000</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 49,000</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 43,000</Text>
          </View>
        </View>

        {/* Revenue per Drone */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Revenue per Drone (Base Case)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Metric</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Value</Text>
          </View>
          {[
            ["Operational days/year", "180"],
            ["Average daily rate (blended)", "CHF 3,500"],
            ["Gross revenue per drone/year", "CHF 630,000"],
            ["Direct costs (crew, maintenance)", "CHF 12,900"],
            ["Crew cost allocation (2-person team)", "CHF 108,000"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { flex: 2 }]}>Contribution margin per drone</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 509,100 (80.8%)</Text>
          </View>
        </View>

        {/* OPEX Table */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Annual Operating Cost per Drone
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Item</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cost/Year</Text>
          </View>
          {[
            ["Maintenance (12% of purchase)", "CHF 5,400"],
            ["Insurance (liability + full)", "CHF 3,000"],
            ["Battery replacement reserve", "CHF 4,500"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { flex: 2 }]}>Total annual OPEX</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 12,900</Text>
          </View>
        </View>
        <Footer page={3} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 2: 6-YEAR P&L ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>02</Text>
        <Text style={s.h2}>6-Year Profit & Loss</Text>
        <Text style={s.subtitle}>
          From CHF 315K (Year 1) to CHF 22.2M (Year 6) with 73% EBITDA margin
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
          {[
            { label: "Year 6 Revenue", value: "CHF 22.2M" },
            { label: "Year 6 EBITDA", value: "CHF 16.1M" },
            { label: "Own Drones (Y6)", value: "5 drones" },
            { label: "Franchise Partners", value: "35" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 12 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Consolidated P&L */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Consolidated P&L
          </Text>
          {/* Header */}
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 90 }]}> </Text>
            {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((h) => (
              <Text key={h} style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{h}</Text>
            ))}
          </View>
          {/* Fleet */}
          {[
            { label: "Own Drones", vals: ["2", "3", "5", "5", "5", "5"] },
            { label: "Pilots", vals: ["2", "5", "10", "15", "20", "25"] },
            { label: "Core Team", vals: ["0", "2", "4", "6", "8", "10"] },
            { label: "Franchise Partners", vals: ["0", "0", "5", "12", "24", "35"], bold: true },
          ].map((row) => (
            <View key={row.label} style={[s.tRow, row.bold ? { borderBottomWidth: 2, borderBottomColor: C.border } : {}]}>
              <Text style={[row.bold ? s.tCellBold : s.tCell, { width: 90 }]}>{row.label}</Text>
              {row.vals.map((v, i) => (
                <Text key={i} style={[row.bold ? s.tCellBold : s.tCell, { flex: 1, textAlign: "right" }]}>{v}</Text>
              ))}
            </View>
          ))}
          {/* Revenue */}
          <View style={{ paddingTop: 4, paddingBottom: 2 }}>
            <Text style={{ fontSize: 6, color: C.accent, letterSpacing: 1, textTransform: "uppercase" }}>Revenue</Text>
          </View>
          {[
            { label: "Own DaaS", vals: ["315K", "1,575K", "3,150K", "5,700K", "8,000K", "10,500K"] },
            { label: "Gov/Military", vals: ["--", "120K", "240K", "480K", "720K", "960K"] },
            { label: "Subtotal Own Ops", vals: ["315K", "1,695K", "3,390K", "6,180K", "8,720K", "11,460K"], accent: true },
            { label: "Franchise entry fees", vals: ["--", "--", "175K", "245K", "350K", "455K"] },
            { label: "Hardware margin", vals: ["--", "--", "150K", "210K", "300K", "390K"] },
            { label: "Royalties (9%)", vals: ["--", "--", "567K", "2,052K", "4,320K", "7,560K"] },
            { label: "SaaS + LUC fees", vals: ["--", "--", "90K", "216K", "396K", "630K"] },
            { label: "Marketing pool (2%)", vals: ["--", "--", "126K", "456K", "960K", "1,680K"] },
            { label: "Subtotal Franchise", vals: ["--", "--", "1,108K", "3,179K", "6,326K", "10,715K"], gold: true },
          ].map((row) => (
            <View
              key={row.label}
              style={[
                s.tRow,
                row.accent ? { backgroundColor: C.accent + "08" } : {},
                row.gold ? { backgroundColor: C.gold + "08" } : {},
              ]}
            >
              <Text
                style={[
                  row.accent ? s.tCellAccent : row.gold ? { ...s.tCellBold, color: C.gold } : s.tCell,
                  { width: 90 },
                ]}
              >
                {row.label}
              </Text>
              {row.vals.map((v, i) => (
                <Text
                  key={i}
                  style={[
                    row.accent ? s.tCellAccent : row.gold ? { ...s.tCellBold, color: C.gold } : s.tCell,
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  {v}
                </Text>
              ))}
            </View>
          ))}
          {/* Total Revenue */}
          <View style={[s.tRow, { backgroundColor: C.accent + "12", borderBottomWidth: 2, borderBottomColor: C.accent }]}>
            <Text style={[s.tCellAccent, { width: 90, fontSize: 8 }]}>TOTAL REVENUE</Text>
            {["315K", "1,695K", "4,498K", "9,359K", "15,046K", "22,175K"].map((v, i) => (
              <Text key={i} style={[s.tCellAccent, { flex: 1, textAlign: "right", fontSize: 8 }]}>{v}</Text>
            ))}
          </View>
          {/* Costs */}
          <View style={{ paddingTop: 4, paddingBottom: 2 }}>
            <Text style={{ fontSize: 6, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>Costs</Text>
          </View>
          {[
            { label: "Drone CAPEX", vals: ["98K", "147K", "245K", "245K", "245K", "245K"] },
            { label: "Fleet OPEX", vals: ["26K", "65K", "129K", "194K", "258K", "323K"] },
            { label: "Crew costs", vals: ["124K", "310K", "620K", "930K", "1,240K", "1,550K"] },
            { label: "Ops vehicles", vals: ["50K", "50K", "100K", "100K", "100K", "100K"] },
            { label: "Fixed costs & platform", vals: ["190K", "243K", "300K", "380K", "460K", "540K"] },
            { label: "Core team salaries", vals: ["0", "240K", "480K", "720K", "960K", "1,200K"] },
            { label: "Franchise ops", vals: ["0", "0", "180K", "360K", "600K", "900K"] },
            { label: "Marketing", vals: ["30K", "60K", "150K", "250K", "400K", "600K"] },
            { label: "Intl. expansion", vals: ["0", "0", "0", "200K", "400K", "600K"] },
          ].map((row) => (
            <View key={row.label} style={s.tRow}>
              <Text style={[s.tCell, { width: 90 }]}>{row.label}</Text>
              {row.vals.map((v, i) => (
                <Text key={i} style={[s.tCell, { flex: 1, textAlign: "right" }]}>{v}</Text>
              ))}
            </View>
          ))}
          <View style={[s.tRow, { borderBottomWidth: 2, borderBottomColor: C.border }]}>
            <Text style={[s.tCellBold, { width: 90 }]}>TOTAL COSTS</Text>
            {["518K", "1,115K", "2,204K", "3,379K", "4,663K", "6,058K"].map((v, i) => (
              <Text key={i} style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{v}</Text>
            ))}
          </View>
          {/* EBITDA */}
          <View style={[s.tRow, { backgroundColor: C.green + "10" }]}>
            <Text style={[s.tCellGreen, { width: 90, fontSize: 8 }]}>EBITDA</Text>
            {[
              { v: "-203K", neg: true },
              { v: "580K", neg: false },
              { v: "2,294K", neg: false },
              { v: "5,980K", neg: false },
              { v: "10,383K", neg: false },
              { v: "16,117K", neg: false },
            ].map((item, i) => (
              <Text
                key={i}
                style={[
                  item.neg ? s.tCellRed : s.tCellGreen,
                  { flex: 1, textAlign: "right", fontSize: 8 },
                ]}
              >
                {item.v}
              </Text>
            ))}
          </View>
          <View style={s.tRow}>
            <Text style={[s.tCell, { width: 90 }]}>EBITDA Margin</Text>
            {["-64%", "34%", "51%", "64%", "69%", "73%"].map((v, i) => (
              <Text
                key={i}
                style={[
                  v.startsWith("-") ? s.tCellRed : s.tCellGreen,
                  { flex: 1, textAlign: "right" },
                ]}
              >
                {v}
              </Text>
            ))}
          </View>
        </View>
        <Footer page={4} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 3: BREAK-EVEN ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>03</Text>
        <Text style={s.h2}>Break-Even Analysis</Text>
        <Text style={s.subtitle}>
          Operational break-even at Month 5-6, full P&L break-even at Month 14
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Monthly Fixed Costs", value: "CHF 15.8K", sub: "Year 1 lean launch" },
            { label: "Daily Contribution", value: "CHF 1,750", sub: "Per drone average" },
            { label: "Operational B/E", value: "Month 5-6", sub: "~9 ops days/month" },
            { label: "Full P&L B/E", value: "Month 14", sub: "Early Year 2" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 13 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 1 }}>{kpi.sub}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Break-Even Timeline
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              { month: "M1", label: "Launch", color: C.red },
              { month: "M5-6", label: "Ops B/E", color: C.gold },
              { month: "M14", label: "Full B/E", color: C.green },
              { month: "M24+", label: "Scale", color: C.green },
            ].map((m) => (
              <View key={m.month} style={{ alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }} />
                <Text style={{ fontSize: 8, fontWeight: "bold", color: m.color }}>{m.month}</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Detailed metrics */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Detailed Break-Even Metrics
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Metric</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Value</Text>
          </View>
          {[
            ["Monthly fixed costs (Year 1)", "CHF 15,800"],
            ["Average daily contribution (1 drone)", "CHF 1,750"],
            ["Break-even point", "~9 operational days/month"],
            ["Operational break-even", "Month 5-6"],
            ["Full P&L break-even", "Month 14 (early Year 2)"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
            </View>
          ))}
        </View>

        {/* ═══ SECTION 4: CASH FLOW ═══ */}
        <View style={{ marginTop: 16 }}>
          <Text style={s.sectionNum}>04</Text>
          <Text style={s.h2}>Cash Flow & Runway</Text>
          <Text style={s.subtitle}>
            Cumulative cash flow from -CHF 203K to +CHF 35.2M over 6 years
          </Text>
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Cash Flow Summary
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 50 }]}> </Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cash In</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cash Out</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Net</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cumulative</Text>
          </View>
          {[
            { yr: "Year 1", ci: "315K", co: "518K", net: "-203K", cum: "-203K", neg: true },
            { yr: "Year 2", ci: "1,695K", co: "1,115K", net: "+580K", cum: "+377K", neg: false },
            { yr: "Year 3", ci: "4,498K", co: "2,204K", net: "+2,294K", cum: "+2,671K", neg: false },
            { yr: "Year 4", ci: "9,359K", co: "3,379K", net: "+5,980K", cum: "+8,651K", neg: false },
            { yr: "Year 5", ci: "15,046K", co: "4,663K", net: "+10,383K", cum: "+19,034K", neg: false },
            { yr: "Year 6", ci: "22,175K", co: "6,058K", net: "+16,117K", cum: "+35,151K", neg: false },
          ].map((row) => (
            <View key={row.yr} style={s.tRow}>
              <Text style={[s.tCellBold, { width: 50 }]}>{row.yr}</Text>
              <Text style={[s.tCellGreen, { flex: 1, textAlign: "right" }]}>{row.ci}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row.co}</Text>
              <Text style={[row.neg ? s.tCellRed : s.tCellGreen, { flex: 1, textAlign: "right" }]}>{row.net}</Text>
              <Text style={[row.neg ? s.tCellRed : s.tCellGreen, { flex: 1, textAlign: "right", fontWeight: "bold" }]}>{row.cum}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 7, color: C.textSecondary, marginTop: 4 }}>
          With CHF 1.5M raised: runway covers Year 1 negative cash flow with CHF 1.3M+ reserve.
        </Text>
        <Footer page={5} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 5: INVESTOR ROI ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>05</Text>
        <Text style={s.h2}>Investor ROI</Text>
        <Text style={s.subtitle}>
          Investor ROI at CHF 200K (convertible note)
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Pre-Money", value: "CHF 8.5M" },
            { label: "Interest Rate", value: "6% p.a." },
            { label: "Conversion Discount", value: "20% (30% Early Bird)" },
            { label: "Instrument", value: "Convertible Note" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 11 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* ROI Scenarios */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Investor ROI at CHF 200K (convertible note)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 1 }]}> </Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Company Valuation</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Investor Equity</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Multiple</Text>
          </View>
          {[
            ["Year 3", "~CHF 45M", "~CHF 1.1M", "5.5\u00d7"],
            ["Year 5", "~CHF 150M", "~CHF 3.5M", "17.5\u00d7"],
            ["Year 6", "~CHF 240M", "~CHF 5.6M", "28\u00d7"],
          ].map((row, i) => (
            <View key={i} style={[s.tRow, i === 2 ? { backgroundColor: C.accent + "08" } : {}]}>
              <Text style={[i === 2 ? s.tCellAccent : s.tCellBold, { flex: 1 }]}>{row[0]}</Text>
              <Text style={[i === 2 ? s.tCellAccent : s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              <Text style={[i === 2 ? s.tCellAccent : s.tCellBold, { flex: 1, textAlign: "right" }]}>{row[2]}</Text>
              <Text style={[i === 2 ? s.tCellAccent : s.tCellBold, { flex: 1, textAlign: "right" }]}>{row[3]}</Text>
            </View>
          ))}
        </View>

        {/* Convertible Note Terms */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, marginBottom: 6 }}>
            Convertible Note Terms
          </Text>
          {[
            "1. Structure: Convertible loan with 6% p.a. accruing interest",
            "2. Conversion discount: 20% at next qualified round (30% Early Bird for CHF 200K+ lead)",
            "3. Pre-money valuation: CHF 8.5M",
            "4. Exit target: Trade sale in 6-8 years (5-10x ARR tech multiple)",
          ].map((text) => (
            <View key={text} style={s.bullet}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{text}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 4 }}>
            * Terms indicative. Final terms subject to formal agreement.
          </Text>
        </View>

        {/* Exit Targets */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.gold, marginBottom: 6 }}>
            Exit Targets
          </Text>
          {[
            { label: "Timeline", value: "Trade sale in 6-8 years" },
            { label: "Valuation basis", value: "5-10x ARR tech multiple (AI + LUC moat)" },
            { label: "Potential acquirers", value: "Die Post, Planzer, Kuehne+Nagel, Implenia, intl. drone infra companies" },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: "row", gap: 6, marginBottom: 3 }}>
              <Text style={{ fontSize: 7, fontWeight: "bold", color: C.accent, width: 80 }}>
                {item.label}:
              </Text>
              <Text style={{ fontSize: 7, color: C.textSecondary, flex: 1 }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
        <Footer page={6} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 6: FRANCHISE ECONOMICS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>06</Text>
        <Text style={s.h2}>Franchise Unit Economics</Text>
        <Text style={s.subtitle}>
          Partner P&L + HQ recurring revenue per franchise partner
        </Text>

        <View style={s.row}>
          {/* Partner P&L */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Franchise Partner P&L (per unit/year)
            </Text>
            <View style={s.tHead}>
              <Text style={[s.tCellBold, { flex: 2 }]}>Item</Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Amount</Text>
            </View>
            {[
              ["Revenue (180d x CHF 3,500)", "CHF 630,000"],
              ["Royalty to HQ (9%)", "-CHF 56,700"],
              ["Marketing pool (2%)", "-CHF 12,600"],
              ["SaaS + LUC fee", "-CHF 18,000"],
              ["Crew costs (2 persons)", "-CHF 175,000"],
              ["Drone OPEX", "-CHF 12,900"],
              ["Vehicle OPEX", "-CHF 8,000"],
            ].map((row, i) => (
              <View key={i} style={s.tRow}>
                <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
                <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              </View>
            ))}
            <View style={[s.tRow, { backgroundColor: C.green + "10" }]}>
              <Text style={[s.tCellGreen, { flex: 2 }]}>Partner Net Income</Text>
              <Text style={[s.tCellGreen, { flex: 1, textAlign: "right" }]}>CHF 346,800</Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: C.green }}>~4x ROI</Text>
              <Text style={{ fontSize: 6, color: C.textMuted }}>on entry investment</Text>
            </View>
          </View>

          {/* HQ Revenue */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              HQ Revenue per Partner
            </Text>
            <View style={s.tHead}>
              <Text style={[s.tCellBold, { flex: 2 }]}>Stream</Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Annual</Text>
            </View>
            {[
              ["Entry fee (amortised)", "CHF 7,000"],
              ["Hardware margin (amortised)", "CHF 6,000"],
              ["Royalties (9%)", "CHF 56,700"],
              ["Marketing pool (2%)", "CHF 12,600"],
              ["SaaS + LUC fee", "CHF 18,000"],
            ].map((row, i) => (
              <View key={i} style={s.tRow}>
                <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
                <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              </View>
            ))}
            <View style={[s.tRow, { backgroundColor: C.gold + "10" }]}>
              <Text style={[{ ...s.tCellBold, color: C.gold }, { flex: 2 }]}>
                HQ recurring per partner
              </Text>
              <Text style={[{ ...s.tCellBold, color: C.gold }, { flex: 1, textAlign: "right" }]}>
                CHF 87,300
              </Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: C.gold }}>CHF 87.3K</Text>
              <Text style={{ fontSize: 6, color: C.textMuted }}>recurring per partner/year</Text>
            </View>
          </View>
        </View>

        {/* ═══ SECTION 7: FLEET GROWTH ═══ */}
        <View style={{ marginTop: 16 }}>
          <Text style={s.sectionNum}>07</Text>
          <Text style={s.h2}>Fleet Growth</Text>
          <Text style={s.subtitle}>
            From 2 drones (Year 1) to 5 own drones + 35 franchise partners (Year 6)
          </Text>
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Fleet & Crew Scale
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 50 }]}> </Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Own</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Franchise</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Total</Text>
          </View>
          {[
            { year: "Year 1", own: 2, franchise: 0, total: 2 },
            { year: "Year 2", own: 3, franchise: 0, total: 3 },
            { year: "Year 3", own: 5, franchise: 5, total: 10 },
            { year: "Year 4", own: 5, franchise: 12, total: 17 },
            { year: "Year 5", own: 5, franchise: 24, total: 29 },
            { year: "Year 6", own: 5, franchise: 35, total: 40 },
          ].map((row) => (
            <View key={row.year} style={s.tRow}>
              <Text style={[s.tCellBold, { width: 50 }]}>{row.year}</Text>
              <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>{row.own}</Text>
              <Text style={[{ ...s.tCellBold, color: C.gold }, { flex: 1, textAlign: "right" }]}>
                {row.franchise || "--"}
              </Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{row.total}</Text>
            </View>
          ))}
          {/* Visual bar representation */}
          <View style={{ marginTop: 8 }}>
            {[
              { year: "Year 1", total: 2 },
              { year: "Year 2", total: 3 },
              { year: "Year 3", total: 10 },
              { year: "Year 4", total: 17 },
              { year: "Year 5", total: 29 },
              { year: "Year 6", total: 40 },
            ].map((row) => (
              <View key={row.year} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Text style={{ fontSize: 6, color: C.textMuted, width: 35 }}>{row.year}</Text>
                <View style={[s.barBg, { flex: 1 }]}>
                  <View style={{ height: 6, width: `${(row.total / 40) * 100}%`, backgroundColor: C.accent, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 7, fontWeight: "bold", color: C.accent, width: 30, textAlign: "right" }}>
                  {row.total}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Footer page={7} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 8: PLATFORM GMV ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>08</Text>
        <Text style={s.h2}>Platform GMV</Text>
        <Text style={s.subtitle}>
          Total ecosystem value -- own operations + franchise partner gross revenue
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Year 6 Platform GMV", value: "CHF 95.5M" },
            { label: "HQ Take Rate", value: "23%" },
            { label: "Franchise Partners", value: "35" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 14 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Platform GMV Growth
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 100 }]}> </Text>
            {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((h) => (
              <Text key={h} style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{h}</Text>
            ))}
          </View>
          {[
            { label: "Own Operations", vals: ["315K", "1,695K", "3,390K", "6,180K", "8,720K", "11,460K"] },
            { label: "Franchise Gross Rev.", vals: ["--", "--", "7,560K", "26,600K", "54,400K", "82,300K"] },
          ].map((row) => (
            <View key={row.label} style={s.tRow}>
              <Text style={[s.tCell, { width: 100 }]}>{row.label}</Text>
              {row.vals.map((v, i) => (
                <Text key={i} style={[s.tCell, { flex: 1, textAlign: "right" }]}>{v}</Text>
              ))}
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { width: 100 }]}>Total Platform GMV</Text>
            {["315K", "3,350K", "13,000K", "34,800K", "64,800K", "95,500K"].map((v, i) => (
              <Text key={i} style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>{v}</Text>
            ))}
          </View>
        </View>

        <Text style={{ fontSize: 7, color: C.textSecondary, marginTop: 4 }}>
          HQ captures ~23% as direct revenue through own operations, royalties, SaaS fees, and franchise margins.
        </Text>

        {/* ═══ SECTION 9: SENSITIVITY ANALYSIS ═══ */}
        <View style={{ marginTop: 20 }}>
          <Text style={s.sectionNum}>09</Text>
          <Text style={s.h2}>Sensitivity Analysis</Text>
          <Text style={s.subtitle}>
            Revenue sensitivity to utilisation rates and daily pricing (Year 6, 125 drones, 35 partners)
          </Text>
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Revenue Sensitivity Grid (Year 6)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 65 }]}>Days \ Rate</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 3,000</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 3,500</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 4,000</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 4,500</Text>
          </View>
          {[
            { days: "150 days", vals: ["13.5M", "15.8M", "18.0M", "20.3M"] },
            { days: "180 days", vals: ["16.2M", "18.9M", "21.6M", "24.3M"] },
            { days: "200 days*", vals: ["18.0M", "21.0M", "22.2M", "27.0M"], base: true },
            { days: "220 days", vals: ["19.8M", "23.1M", "26.4M", "29.7M"] },
          ].map((row) => (
            <View key={row.days} style={[s.tRow, row.base ? { backgroundColor: C.accent + "08" } : {}]}>
              <Text style={[row.base ? s.tCellAccent : s.tCellBold, { width: 65 }]}>
                {row.days}
              </Text>
              {row.vals.map((v, i) => (
                <Text
                  key={i}
                  style={[
                    row.base && i === 2
                      ? { ...s.tCellAccent, fontSize: 8 }
                      : s.tCell,
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  CHF {v}
                </Text>
              ))}
            </View>
          ))}
          <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 4 }}>
            * Base case: 200 days x CHF 4,000/day = CHF 22.2M
          </Text>
        </View>

        {/* Risk Factors */}
        <View style={[s.card, { marginTop: 8 }]}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Key Risk Factors & Mitigations
          </Text>
          {[
            { risk: "Regulatory delay (LUC)", mitigation: "SORA enables commercial ops while LUC pending" },
            { risk: "Weather / utilisation", mitigation: "Gov retainers provide baseline revenue regardless of weather" },
            { risk: "Competition", mitigation: "LUC + AI moat = 18+ month head start; no Swiss competitor close" },
            { risk: "Drone reliability", mitigation: "Backup drone strategy (2 drones, 1 operational + 1 redundancy)" },
          ].map((item) => (
            <View key={item.risk} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 7, fontWeight: "bold", color: C.accent, width: 100 }}>
                {item.risk}
              </Text>
              <Text style={{ fontSize: 7, color: C.textSecondary, flex: 1 }}>
                {item.mitigation}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 8, fontStyle: "italic" }}>
          Based on management estimates. Subject to market conditions and regulatory timelines.
        </Text>
        <Footer page={8} total={TOTAL} />
      </Page>
    </Document>
  );
}
