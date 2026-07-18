import { useState } from "react";

const plans = [
  {
    name: "Starter",
    tagline: "Explore freely",
    price: { monthly: 0, yearly: 0 },
    cta: "Get started free",
    highlight: false,
    color: "#94a3b8",
    features: [
      "2 active workspaces",
      "1 GB project storage",
      "30 min inactivity timeout",
    ],
    limits: ["No Java runtime", "No persistent storage"],
  },
  {
    name: "Pro",
    tagline: "Ship every day",
    price: { monthly: 12, yearly: 9 },
    cta: "Start building →",
    highlight: true,
    color: "#bd4f01",
    features: [
      "10 active workspaces",
      "10 GB S3-backed storage",
      "Workspaces never sleep",
      "Priority instance assignment",
    ],
    limits: [],
  },
  {
    name: "Team",
    tagline: "Collaborate at scale",
    price: { monthly: 29, yearly: 22 },
    cta: "Start with team →",
    highlight: false,
    color: "#8b5cf6",
    features: [
      "Unlimited workspaces",
      "Dedicated EC2 instances",
    ],
    limits: [],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="w-full" style={{
      minHeight: "100vh",
      background: "#070708",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>

      {/* Background decorative blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "30%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 65%)",
        }} />
      </div >



      {/* Header */}
      < div style={{
        position: "relative", zIndex: 1,
        textAlign: "center", padding: "72px 24px 52px",
      }}>
        {/* Billing toggle */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 0,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: 4,
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {["Monthly", "Yearly"].map((label) => {
            const isActive = (label === "Yearly") === yearly;
            return (
              <button
                key={label}
                onClick={() => setYearly(label === "Yearly")}
                style={{
                  padding: "9px 22px", borderRadius: 9, border: "none",
                  background: isActive ? "rgba(255,255,255,0.9)" : "transparent",
                  color: isActive ? "#0f0f0f" : "#9ca3af",
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {label}
                {label === "Yearly" && (
                  <span style={{
                    background: isActive ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.1)",
                    color: isActive ? "#f97316" : "#9ca3af",
                    fontSize: 11, fontWeight: 700,
                    padding: "2px 7px", borderRadius: 999,
                    transition: "all 0.2s",
                  }}>-25%</span>
                )}
              </button>
            );
          })}
        </div>
      </div >

      {/* Cards */}
      < div className="" style={{
        position: "relative", zIndex: 1,
        display: "flex", gap: 20, justifyContent: "center",
        padding: "0 24px 80px", flexWrap: "wrap", alignItems: "center",
      }}>
        {
          plans.map((plan, i) => {
            const isHovered = hovered === i;
            const price = yearly ? plan.price.yearly : plan.price.monthly;

            // Determine card border gradient
            const borderGradient = plan.highlight
              ? "linear-gradient(135deg, #f97316a0, #f9731640, rgba(139,92,246,0.5))"
              : plan.name === "Team"
                ? "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(139,92,246,0.15))"
                : "linear-gradient(135deg, rgba(148,163,184,0.4), rgba(148,163,184,0.15))";

            // Determine card inner background gradient matching user reference image glows
            const cardBackground = plan.highlight
              ? "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #faf5ff 100%)"
              : plan.name === "Team"
                ? "linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #f1f5f9 100%)"
                : "linear-gradient(135deg, #f7f9fc 0%, #ffffff 50%, #f1f5f9 100%)";

            return (
              <div
                key={plan.name}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 320,
                  borderRadius: 24,
                  padding: plan.highlight ? 2 : 1,
                  background: borderGradient,
                  transform: plan.highlight
                    ? "translateY(-12px) scale(1.02)"
                    : isHovered ? "translateY(-6px)" : "translateY(0)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  boxShadow: plan.highlight
                    ? `0 32px 64px rgba(249,115,22,0.3), 0 8px 24px rgba(0,0,0,0.3)`
                    : isHovered
                      ? "0 24px 48px rgba(0,0,0,0.3)"
                      : "0 8px 24px rgba(0,0,0,0.2)",
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #f97316, #ea580c)",
                    color: "#fff", fontSize: 10, fontWeight: 800,
                    padding: "5px 18px", borderRadius: 999,
                    letterSpacing: "1px", whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px #bd4f01",
                    zIndex: 2,
                  }}>
                    ✦ MOST POPULAR
                  </div>
                )}

                {/* Glass card inner */}
                <div style={{
                  borderRadius: plan.highlight ? 22 : 23,
                  background: cardBackground,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  padding: "36px 30px",
                  position: "relative",
                  overflow: "hidden",
                }}>

                  {/* Subtle inner glow */}
                  <div style={{
                    position: "absolute", top: -60, right: -60,
                    width: 180, height: 180, borderRadius: "50%",
                    background: `radial-gradient(circle, ${plan.color}24 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }} />

                  {/* Header */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: plan.color, letterSpacing: "0.5px",
                      }}>{plan.name}</span>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: plan.color,
                        boxShadow: `0 0 8px ${plan.color}`,
                      }} />
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div style={{
                    marginBottom: 28, paddingBottom: 28,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 500, color: "#6b7280",
                        marginBottom: 10,
                      }}>$</span>
                      <span style={{
                        fontSize: 56, fontWeight: 800, letterSpacing: "-3px",
                        lineHeight: 1, color: "#0f0f0f",
                      }}>{price}</span>
                      {plan.price.monthly > 0 && (
                        <span style={{ color: "#6b7280", fontSize: 14, marginBottom: 10 }}>/mo</span>
                      )}
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "8px 0 0" }}>
                      {plan.price.monthly === 0
                        ? "Always free, no card needed"
                        : yearly
                          ? `Billed $${plan.price.yearly * 12}/year — save $${(plan.price.monthly - plan.price.yearly) * 12}`
                          : "Billed monthly, cancel anytime"}
                    </p>
                  </div>

                  {/* CTA */}
                  <button style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: 12, border: "none",
                    background: plan.highlight
                      ? `linear-gradient(135deg, ${plan.color}, #ea580c)`
                      : "rgba(0,0,0,0.06)",
                    color: plan.highlight ? "#fff" : "#374151",
                    fontSize: 15, fontWeight: 600, cursor: "pointer",
                    marginBottom: 28,
                    boxShadow: plan.highlight ? `0 6px 20px ${plan.color}40` : "none",
                    transition: "all 0.2s",
                    letterSpacing: "-0.2px",
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "0.88";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                          background: `${plan.color}14`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5L4.5 8L9 3" stroke={plan.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span style={{ color: "#374151", fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                    {plan.limits.map((l) => (
                      <div key={l} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                          background: "rgba(0,0,0,0.04)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M3 3L8 8M8 3L3 8" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <span style={{ color: "#c4c9d4", fontSize: 14, lineHeight: 1.5 }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div >

      {/* FAQ */}
      < div className="" style={{
        position: "relative", zIndex: 1,
        maxWidth: 680, margin: "0 auto", padding: "0 24px 80px",
      }}>
        <p style={{
          textAlign: "center", fontSize: 12, fontWeight: 700,
          letterSpacing: "1.5px", color: "#9ca3af",
          textTransform: "uppercase", marginBottom: 28,
        }}>Common questions</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { q: "Can I cancel anytime?", a: "Yes. No contracts. Cancel from your dashboard instantly, effective immediately." },
            { q: "What happens to my projects?", a: "All projects are saved to S3. You get 30 days to export after cancellation." },
            { q: "Can I switch plans?", a: "Upgrade or downgrade anytime. Changes take effect immediately, prorated." },
            { q: "Student discount?", a: "Yes — email us with your .edu address and get 50% off Pro forever." },
          ].map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={item.q}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
                style={{
                  borderRadius: 16,
                  padding: 1,
                  background: "linear-gradient(135deg, rgba(148,163,184,0.3), rgba(148,163,184,0.1))",
                  boxShadow: isOpen ? "0 8px 24px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  borderRadius: 15,
                  background: "linear-gradient(135deg, #f7f9fc 0%, #ffffff 50%, #f1f5f9 100%)",
                  padding: "20px 24px",
                  transition: "background 0.2s ease",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}>
                    <span style={{
                      color: "#0f0f0f",
                      fontSize: 14.5,
                      fontWeight: 600,
                      userSelect: "none",
                    }}>
                      {item.q}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4b5563"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <div style={{
                    maxHeight: isOpen ? "100px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, margin-top 0.3s ease",
                    marginTop: isOpen ? 12 : 0,
                  }}>
                    <p style={{
                      color: "#4b5563",
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div >

      {/* Footer strip */}
      < div style={{
        position: "relative", zIndex: 1,
        textAlign: "center", padding: "0 24px 48px",
      }}>
        <p style={{ color: "#9ca3af", fontSize: 13 }}>
          Questions? <span style={{ color: "#f97316", cursor: "pointer" }}>Talk to us</span> — we reply within 24 hours.
        </p>
      </div >
    </div >
  );
}