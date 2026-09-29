import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { EmployeeFullResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";

const PRIMARY = "#1DA081";
const LABEL_COLOR = "#666666";
const BORDER = "#d9d9d9";
const SECTION_BG = "#f5f5f5";
const TABLE_HEADER_BG = "#e8f5f1";
const TEXT = "#1a1a1a";

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical: 35,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT,
  },
  // Header
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingBottom: 6,
    marginBottom: 10,
  },
  pageHeaderTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  pageHeaderSub: { fontSize: 8, color: LABEL_COLOR, letterSpacing: 1 },
  pageHeaderRight: { alignItems: "flex-end" },
  pageHeaderName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  pageHeaderEmpNo: { fontSize: 9, color: LABEL_COLOR },
  pageHeaderStatus: { fontSize: 9, color: PRIMARY },
  // Section card
  sectionCard: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: SECTION_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  sectionHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: PRIMARY,
    letterSpacing: 0.5,
  },
  // Label-value row
  lvRow: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
  },
  lvLabel: { width: 110, color: LABEL_COLOR, fontSize: 8 },
  lvValue: { flex: 1, fontSize: 9 },
  // Two-col layout
  twoCol: { flexDirection: "row" },
  colHalf: { flex: 1 },
  // Table
  tableHeaderRow: { flexDirection: "row", backgroundColor: TABLE_HEADER_BG },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
  },
  thCell: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: TEXT,
  },
  tdCell: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontSize: 8,
    color: TEXT,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: LABEL_COLOR,
  },
});

function LVRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.lvRow}>
      <Text style={styles.lvLabel}>{label}</Text>
      <Text style={styles.lvValue}>{value || "—"}</Text>
    </View>
  );
}

function TwoColRow({
  left,
  right,
}: {
  left: [string, string | undefined | null];
  right: [string, string | undefined | null];
}) {
  return (
    <View style={styles.twoCol}>
      <View style={styles.colHalf}>
        <LVRow label={left[0]} value={left[1]} />
      </View>
      <View style={styles.colHalf}>
        <LVRow label={right[0]} value={right[1]} />
      </View>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// Calendar dates only (DOB, Hire Date, Contract Start/End, etc.) -- these carry no timezone
// meaning, so dayjs parses and renders the date components exactly as sent, never shifted
// through native Date's UTC-vs-local string-parsing quirks (e.g. a date-only string like
// "2001-10-01" is parsed as UTC midnight by `new Date(...)`, which can roll back a day once
// converted to the viewer's local time).
function fmt(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = dayjs(dateStr);
  return d.isValid() ? d.format("MMM DD, YYYY") : dateStr;
}

function fmtMonthYear(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = dayjs(dateStr);
  return d.isValid() ? d.format("MMM YYYY") : dateStr;
}

function fmtRate(v?: number | null) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(2)}%`;
}

function fmtMoney(v?: number | null) {
  if (v == null || v === 0) return "—";
  return v.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export default function Employee201Document({
  data,
}: {
  data: EmployeeFullResponse;
}) {
  const fullName =
    data.fullName ||
    [data.lastName, data.firstName, data.middleName]
      .filter(Boolean)
      .join(", ")
      .replace(/, ([^,]*)$/, " $1");

  const restDayStr = data.restDays?.map((r) => r.dayName).join(", ") || "—";

  return (
    <Document
      title={`201 File — ${fullName}`}
      author="One Punch HRIS"
      creator="One Punch HRIS"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Page Header ── */}
        <View style={styles.pageHeader} fixed>
          <View>
            <Text style={styles.pageHeaderTitle}>ONE PUNCH HRIS</Text>
            <Text style={styles.pageHeaderSub}>EMPLOYEE 201 FILE</Text>
          </View>
          <View style={styles.pageHeaderRight}>
            <Text style={styles.pageHeaderName}>{fullName}</Text>
            <Text style={styles.pageHeaderEmpNo}>#{data.employeeNo}</Text>
            <Text style={styles.pageHeaderStatus}>{data.employmentStatus}</Text>
          </View>
        </View>

        {/* ── Personal Information ── */}
        <SectionCard title="PERSONAL INFORMATION">
          <TwoColRow
            left={["Full Name", fullName]}
            right={["Date of Birth", fmt(data.dob)]}
          />
          <TwoColRow
            left={["Gender", data.gender]}
            right={["Age", data.age?.toString()]}
          />
          <TwoColRow
            left={["Civil Status", data.civilStatus]}
            right={["Blood Type", data.bloodType]}
          />
          <TwoColRow
            left={["Contact No.", data.contact]}
            right={["Email", data.email]}
          />
          <LVRow label="Address 1" value={data.address1} />
          <LVRow label="Address 2" value={data.address2} />
        </SectionCard>

        {/* ── Employment Details ── */}
        <SectionCard title="EMPLOYMENT DETAILS">
          <TwoColRow
            left={["Employee No.", data.employeeNo]}
            right={["Hire Date", fmt(data.hireDate)]}
          />
          <TwoColRow
            left={["Department", data.departmentName]}
            right={["Section", "—"]}
          />
          <TwoColRow
            left={["Position", data.positionName]}
            right={["Job Level", data.jobLevel]}
          />
          <TwoColRow
            left={["Branch", data.branchName]}
            right={["Client / Site", data.clientName]}
          />
          <TwoColRow
            left={["Operation Area", data.areaName]}
            right={["Hiring Entity", data.hiringEntity]}
          />
          <TwoColRow
            left={["Employment Status", data.employmentStatus]}
            right={["Status", data.status]}
          />
          {(data.contractStart || data.contractEnd) && (
            <TwoColRow
              left={["Contract Start", fmt(data.contractStart)]}
              right={["Contract End", fmt(data.contractEnd)]}
            />
          )}
          <LVRow label="Time Shift" value={data.timeShiftName} />
          <LVRow label="Payroll Group" value={data.payrollGroupName} />
          <LVRow label="Rest Days" value={restDayStr} />
        </SectionCard>

        {/* ── Compensation ── */}
        <SectionCard title="COMPENSATION / PAYROLL RUN">
          <TwoColRow
            left={["Salary Type", data.salaryType]}
            right={["Mode of Payment", data.modeOfPayment]}
          />
          <TwoColRow
            left={["Monthly Rate", fmtMoney(data.monthlyRate)]}
            right={["Daily Rate", fmtMoney(data.dailyRate)]}
          />
          <TwoColRow
            left={["COLA (per payroll)", fmtMoney(data.cola)]}
            right={["Bank Name", data.bankName]}
          />
          <LVRow label="Bank Account No." value={data.bankNo} />
        </SectionCard>

        {/* ── Government / Deductions ── */}
        <SectionCard title="OTHER INCOME & DEDUCTIONS (GOVERNMENT)">
          <View style={styles.tableHeaderRow}>
            {(
              [
                "Contribution",
                "Number",
                "Basis",
                "EE Rate",
                "ER Rate",
                "Add-Ons",
              ] as const
            ).map((h, i) => (
              <Text
                key={i}
                style={[
                  styles.thCell,
                  i === 0
                    ? { width: 70 }
                    : i === 1
                      ? { width: 85 }
                      : i === 2
                        ? { flex: 1 }
                        : { width: 55 },
                ]}
              >
                {h}
              </Text>
            ))}
          </View>
          {[
            { label: "SSS", no: data.sssNo, rate: data.sssRate },
            { label: "PhilHealth", no: data.phicNo, rate: data.phicRate },
            { label: "Pag-IBIG", no: data.hdmfNo, rate: data.hdmfRate },
            {
              label: "Tax (BIR)",
              no: data.tin,
              rate: data.taxRate,
              noER: true,
            },
          ].map(({ label, no, rate, noER }) => (
            <View key={label} style={styles.tableRow}>
              <Text style={[styles.tdCell, { width: 70 }]}>{label}</Text>
              <Text style={[styles.tdCell, { width: 85 }]}>{no || "—"}</Text>
              <Text style={[styles.tdCell, { flex: 1 }]}>
                {rate?.computationType || "—"}
              </Text>
              <Text style={[styles.tdCell, { width: 55 }]}>
                {fmtRate(rate?.eE)}
              </Text>
              <Text style={[styles.tdCell, { width: 55 }]}>
                {noER ? "—" : fmtRate(rate?.eR)}
              </Text>
              <Text style={[styles.tdCell, { width: 55 }]}>
                {fmtRate(rate?.addOns)}
              </Text>
            </View>
          ))}
        </SectionCard>

        {/* ── Education ── */}
        {data.educations && data.educations.length > 0 && (
          <SectionCard title="EDUCATION">
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { flex: 3 }]}>
                School / Institution
              </Text>
              <Text style={[styles.thCell, { width: 100 }]}>
                Year Graduated
              </Text>
            </View>
            {data.educations.map((e) => (
              <View key={e.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { flex: 3 }]}>
                  {e.schoolName || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 100 }]}>
                  {e.yearGraduated > 0 ? e.yearGraduated : "—"}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Skills ── */}
        {data.skills && data.skills.length > 0 && (
          <SectionCard title="SKILLS">
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { flex: 3 }]}>Skill</Text>
              <Text style={[styles.thCell, { width: 80 }]}>Level (0–10)</Text>
            </View>
            {data.skills.map((s) => (
              <View key={s.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { flex: 3 }]}>
                  {s.name || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 80 }]}>{s.level}</Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Dependents ── */}
        {data.dependents && data.dependents.length > 0 && (
          <SectionCard title="DEPENDENTS">
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { flex: 3 }]}>Full Name</Text>
              <Text style={[styles.thCell, { flex: 2 }]}>Relationship</Text>
              <Text style={[styles.thCell, { width: 55 }]}>Gender</Text>
              <Text style={[styles.thCell, { width: 85 }]}>Date of Birth</Text>
            </View>
            {data.dependents.map((d) => (
              <View key={d.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { flex: 3 }]}>
                  {d.fullName || "—"}
                </Text>
                <Text style={[styles.tdCell, { flex: 2 }]}>
                  {d.relationship || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 55 }]}>
                  {d.gender || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 85 }]}>{fmt(d.dob)}</Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Employment History ── */}
        {data.employments && data.employments.length > 0 && (
          <SectionCard title="EMPLOYMENT HISTORY">
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { flex: 3 }]}>Company</Text>
              <Text style={[styles.thCell, { flex: 2 }]}>Position</Text>
              <Text style={[styles.thCell, { width: 75 }]}>From</Text>
              <Text style={[styles.thCell, { width: 75 }]}>To</Text>
            </View>
            {data.employments.map((h) => (
              <View key={h.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { flex: 3 }]}>
                  {h.companyName || "—"}
                </Text>
                <Text style={[styles.tdCell, { flex: 2 }]}>
                  {h.position || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 75 }]}>
                  {fmtMonthYear(h.fromDate)}
                </Text>
                <Text style={[styles.tdCell, { width: 75 }]}>
                  {fmtMonthYear(h.toDate)}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Assigned Assets ── */}
        {data.assets && data.assets.length > 0 && (
          <SectionCard title="ASSIGNED ASSETS">
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { width: 80 }]}>Asset Type</Text>
              <Text style={[styles.thCell, { flex: 2 }]}>Description</Text>
              <Text style={[styles.thCell, { width: 75 }]}>Serial No.</Text>
              <Text style={[styles.thCell, { width: 35 }]}>Qty</Text>
              <Text style={[styles.thCell, { width: 65 }]}>Issued</Text>
              <Text style={[styles.thCell, { width: 60 }]}>Status</Text>
            </View>
            {data.assets.map((a) => (
              <View key={a.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { width: 80 }]}>
                  {a.assetType || "—"}
                </Text>
                <Text style={[styles.tdCell, { flex: 2 }]}>
                  {a.assetDescription || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 75 }]}>
                  {a.serialNo || "—"}
                </Text>
                <Text style={[styles.tdCell, { width: 35 }]}>{a.qty}</Text>
                <Text style={[styles.tdCell, { width: 65 }]}>
                  {fmt(a.issuanceDate)}
                </Text>
                <Text style={[styles.tdCell, { width: 60 }]}>
                  {a.status || "—"}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Document Attachments ── */}
        {data.employeeRecords && data.employeeRecords.length > 0 && (
          <SectionCard title="DOCUMENT ATTACHMENTS">
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thCell, { width: 100 }]}>Record Type</Text>
              <Text style={[styles.thCell, { flex: 2 }]}>Description</Text>
              <Text style={[styles.thCell, { flex: 2 }]}>File / Reference</Text>
            </View>
            {data.employeeRecords.map((r) => (
              <View key={r.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { width: 100 }]}>
                  {r.recordType || "—"}
                </Text>
                <Text style={[styles.tdCell, { flex: 2 }]}>
                  {r.description || "—"}
                </Text>
                <Text style={[styles.tdCell, { flex: 2 }]}>
                  {r.file || "—"}
                </Text>
              </View>
            ))}
          </SectionCard>
        )}

        {/* ── Footer ── */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} — Generated ${new Date().toLocaleDateString("en-PH")}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
