import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, Code2, ShieldAlert, BarChart3, HelpCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function BenchmarkCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("keyset");

  const runBenchmark = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await axios.get(`${API_BASE}/products/benchmark`);
      setData(res.data);
    } catch (err) {
      console.error("Benchmark error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSpeedMultiplier = () => {
    if (!data) return 0;
    const offset = data.offset_pagination_ms;
    const keyset = data.keyset_pagination_ms || 1;
    return (offset / keyset).toFixed(1);
  };

  return (
    <div style={s.page} className="container">
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.subtitle}>LATENCY COMPARISON AT DEPTH 50,000</h2>
        <h1 style={s.title}>Pagination Benchmark</h1>
        <p style={s.desc}>
          Observe the dramatic speed difference when scanning 50,000 records using index-based Keyset sorting vs full-scan offsets.
        </p>
      </div>

      {/* Main Console Grid */}
      <div style={s.consoleGrid}>
        {/* Left Column: Interactive Test */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <BarChart3 size={18} style={{ color: "var(--accent-primary)" }} />
            <h3 style={s.cardTitle}>Run Performance Test</h3>
          </div>
          <p style={s.cardText}>
            This triggers a query to a PostgreSQL database holding 200k items. It compares:
            <br />
            <code>OFFSET 50000</code> vs <code>WHERE (created_at, id) &lt; (anchor_created_at, anchor_id)</code>
          </p>

          <button
            onClick={runBenchmark}
            disabled={loading}
            style={{
              ...s.runBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={s.spinner}
                />
                Simulating Queries...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Run Benchmark
              </>
            )}
          </button>

          {/* Results Visualizer */}
          <AnimatePresence mode="wait">
            {data && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={s.resultsWrapper}
              >
                {/* Speed Multiplier Badge */}
                <div style={s.speedupBadge}>
                  <Zap size={22} style={{ color: "var(--success)" }} />
                  <div>
                    <span style={s.multiplierText}>{getSpeedMultiplier()}x Faster</span>
                    <span style={s.multiplierSub}>With Keyset Pagination</span>
                  </div>
                </div>

                {/* Graph bars */}
                <div style={s.chart}>
                  {/* Offset Bar */}
                  <div style={s.chartRow}>
                    <div style={s.chartRowInfo}>
                      <span style={s.queryName}>OFFSET PAGINATION</span>
                      <span style={s.timeBad}>{data.offset_pagination_ms}ms</span>
                    </div>
                    <div style={s.barContainer}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={s.barBad}
                      />
                    </div>
                  </div>

                  {/* Keyset Bar */}
                  <div style={s.chartRow}>
                    <div style={s.chartRowInfo}>
                      <span style={s.queryName}>KEYSET PAGINATION</span>
                      <span style={s.timeGood}>{data.keyset_pagination_ms}ms</span>
                    </div>
                    <div style={s.barContainer}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(
                            5,
                            (data.keyset_pagination_ms / data.offset_pagination_ms) * 100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        style={s.barGood}
                      />
                    </div>
                  </div>
                </div>

                <div style={s.note}>
                  * Note: Both queries return the exact same page of data. Keyset pagination achieves sub-millisecond response thanks to indexed boundary lookups.
                </div>
              </motion.div>
            )}

            {!data && !loading && (
              <div style={s.placeholder}>
                <Zap size={48} style={s.placeholderIcon} />
                <p>Click the button above to run the database benchmark.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Code Explanation & Tabs */}
        <div style={s.card}>
          <div style={s.tabsHeader}>
            <button
              onClick={() => setActiveTab("keyset")}
              style={{
                ...s.tabBtn,
                color: activeTab === "keyset" ? "#fff" : "var(--text-secondary)",
                borderBottomColor: activeTab === "keyset" ? "var(--accent-primary)" : "transparent",
              }}
            >
              <Code2 size={14} /> Keyset SQL
            </button>
            <button
              onClick={() => setActiveTab("offset")}
              style={{
                ...s.tabBtn,
                color: activeTab === "offset" ? "#fff" : "var(--text-secondary)",
                borderBottomColor: activeTab === "offset" ? "var(--accent-primary)" : "transparent",
              }}
            >
              <Code2 size={14} /> Offset SQL
            </button>
            <button
              onClick={() => setActiveTab("security")}
              style={{
                ...s.tabBtn,
                color: activeTab === "security" ? "#fff" : "var(--text-secondary)",
                borderBottomColor: activeTab === "security" ? "var(--accent-primary)" : "transparent",
              }}
            >
              <ShieldAlert size={14} /> Cryptographic Cursors
            </button>
          </div>

          <div style={s.tabContent}>
            {activeTab === "keyset" && (
              <div>
                <h4 style={s.tabTitle}>How Keyset Query Works</h4>
                <p style={s.tabText}>
                  Keyset pagination queries rows that are strictly "before" or "after" the specific anchor row using a fast composite index.
                </p>
                <pre style={s.codeBlock}>
{`SELECT id, name, category, price, created_at
FROM products
WHERE category = 'Electronics'
  AND (created_at, id) < ('2026-06-20T14:30:00Z', 104231)
ORDER BY created_at DESC, id DESC
LIMIT 20;`}
                </pre>
                <div style={s.bulletPoints}>
                  <div style={s.bullet}>⚡ <strong>O(1) complexity:</strong> Utilizes multi-column index scan.</div>
                  <div style={s.bullet}>🛡️ <strong>Stable layout:</strong> Database updates do not duplicate or skip items.</div>
                </div>
              </div>
            )}

            {activeTab === "offset" && (
              <div>
                <h4 style={s.tabTitle}>How Offset Query Works</h4>
                <p style={s.tabText}>
                  Offset pagination forces the database to read and discard all prior records up to the target index.
                </p>
                <pre style={s.codeBlock}>
{`SELECT id, name, category, price, created_at
FROM products
WHERE category = 'Electronics'
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 50000;`}
                </pre>
                <div style={s.bulletPoints}>
                  <div style={s.bullet}>⚠️ <strong>O(N) complexity:</strong> Higher offset numbers mean slower execution.</div>
                  <div style={s.bullet}>🛑 <strong>Unstable listings:</strong> Concurrent inserts shifts records, leading to duplicates.</div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h4 style={s.tabTitle}>HMAC-Signed Keyset Cursors</h4>
                <p style={s.tabText}>
                  To prevent users from scraping or tampering with the parameters of the cursor, the cursor is signed using an HMAC SHA256 signature generated on the backend:
                </p>
                <pre style={s.codeBlock}>
{`// Backend verification
function decodeCursor(cursor) {
  const [data, sig] = cursor.split(".");
  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");
    
  if (sig !== expectedSig) {
    throw new Error("Tampered cursor!");
  }
  return JSON.parse(atob(data));
}`}
                </pre>
                <div style={s.bulletPoints}>
                  <div style={s.bullet}>🔒 <strong>Integrity check:</strong> Modifying cursor throws a 400 Bad Request error.</div>
                  <div style={s.bullet}>🎒 <strong>Encapsulated state:</strong> Internal parameters remain hidden.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  header: {
    marginBottom: "32px",
  },
  subtitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "var(--accent-primary)",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 8px 0",
    fontFamily: "var(--font-heading)",
  },
  desc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  consoleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "30px",
    width: "100%",
  },
  card: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    fontFamily: "var(--font-heading)",
  },
  cardText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  runBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 24px",
    borderRadius: "28px",
    background: "var(--accent-gradient)",
    color: "#fff",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
  },
  resultsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    marginTop: "10px",
  },
  speedupBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "var(--success-bg)",
    border: "1px solid var(--success-border)",
    padding: "16px",
    borderRadius: "12px",
  },
  multiplierText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--success)",
    display: "block",
    fontFamily: "var(--font-heading)",
  },
  multiplierSub: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    display: "block",
    marginTop: "-2px",
  },
  chart: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  chartRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  chartRowInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  queryName: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-muted)",
    letterSpacing: "0.5px",
  },
  timeBad: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--error)",
  },
  timeGood: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--success)",
  },
  barContainer: {
    width: "100%",
    height: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  barBad: {
    height: "100%",
    backgroundColor: "var(--error)",
    borderRadius: "4px",
  },
  barGood: {
    height: "100%",
    backgroundColor: "var(--success)",
    borderRadius: "4px",
  },
  note: {
    fontSize: "11px",
    color: "var(--text-muted)",
    lineHeight: "1.4",
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    border: "1px dashed var(--border-color)",
    borderRadius: "12px",
    color: "var(--text-muted)",
    fontSize: "13px",
    textAlign: "center",
    gap: "12px",
  },
  placeholderIcon: {
    color: "rgba(255, 255, 255, 0.05)",
  },
  tabsHeader: {
    display: "flex",
    borderBottom: "1px solid var(--border-color)",
    marginBottom: "16px",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s, border-bottom-color 0.2s",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  tabTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "10px",
    fontFamily: "var(--font-heading)",
  },
  tabText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  codeBlock: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "12px",
    color: "#e2e8f0",
    fontFamily: "var(--font-mono)",
    overflowX: "auto",
    lineHeight: "1.5",
    marginBottom: "20px",
  },
  bulletPoints: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  bullet: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
};
