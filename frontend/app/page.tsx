"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Users, BarChart2, Layers } from "lucide-react";

/* ─── Animation variants (Emil Kowalski style easing) ── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

/* ─── Stat data ──────────────────────────────────────── */
const stats = [
  { label: "Departments", value: "12" },
  { label: "Role Guards", value: "100%" },
  { label: "API Endpoints", value: "80+" },
  { label: "Real-time Events", value: "Live" },
];

/* ─── Feature data ───────────────────────────────────── */
const features = [
  {
    icon: ShieldCheck,
    title: "Strict RBAC",
    desc: "Every endpoint decorated with role guards. No route is reachable without proper clearance.",
  },
  {
    icon: Layers,
    title: "12 Tailored Dashboards",
    desc: "Pre-Sales, Sales, Finance, Directors — every role gets a workspace built exactly for their workflow.",
  },
  {
    icon: BarChart2,
    title: "Deep Analytics",
    desc: "Recharts-powered charts with real data. Track leads, conversions, commissions, and inventory in real time.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    desc: "Socket.io powers live notifications and team chat across all roles without a page reload.",
  },
  {
    icon: Zap,
    title: "Next.js 16 + React 19",
    desc: "Server Components, streaming, and Better Auth for bulletproof session management at scale.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Ambient background blobs ─────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {/* Top-left warm glow */}
        <div style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: "55%",
          height: "55%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        {/* Bottom-right cool glow */}
        <div style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        {/* Subtle grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Navbar ───────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: "var(--radius-md)",
            background: "var(--brand-600)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, border: "2px solid rgba(255,255,255,0.9)", background: "transparent" }} />
          </div>
          <span style={{
            fontSize: "var(--text-base)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}>
            OpenEstate
          </span>
        </div>

        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "var(--shadow-sm)",
            transition: `
              background var(--duration-base) var(--ease-out-expo),
              box-shadow var(--duration-base) var(--ease-out-expo),
              color var(--duration-base) var(--ease-out-expo),
              transform var(--duration-fast) var(--ease-in-out)
            `,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.background = "var(--brand-600)";
            el.style.color = "white";
            el.style.boxShadow = "var(--shadow-brand)";
            el.style.borderColor = "var(--brand-600)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.background = "var(--bg-surface)";
            el.style.color = "var(--text-secondary)";
            el.style.boxShadow = "var(--shadow-sm)";
            el.style.borderColor = "var(--border-default)";
          }}
        >
          Sign In
          <ArrowRight size={13} />
        </Link>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "80px 32px 0" }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: "var(--radius-full)",
              background: "var(--brand-50)",
              border: "1px solid var(--brand-200)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--brand-700)",
              marginBottom: 32,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--brand-500)",
                animation: "pulse-brand 2s ease infinite",
                display: "inline-block",
              }} />
              Real Estate Enterprise CRM
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: "var(--text-primary)",
              margin: "0 0 24px",
            }}
          >
            The CRM built for{" "}
            <span style={{
              background: "linear-gradient(135deg, var(--brand-600) 0%, #a855f7 50%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              every role.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--text-tertiary)",
              lineHeight: 1.7,
              margin: "0 auto 40px",
              maxWidth: 560,
              fontWeight: 450,
            }}
          >
            Twelve deeply-polished departmental dashboards, end-to-end RBAC,
            and real-time collaboration — secured with NestJS and Better Auth.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: EASE_SPRING }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 32px",
                borderRadius: "var(--radius-full)",
                background: "var(--brand-600)",
                color: "white",
                fontSize: "var(--text-base)",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "var(--shadow-brand)",
                letterSpacing: "-0.01em",
                transition: `
                  background var(--duration-base) var(--ease-out-expo),
                  box-shadow var(--duration-base) var(--ease-out-expo),
                  transform var(--duration-fast) var(--ease-in-out)
                `,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--brand-700)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px -4px rgba(124,58,237,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--brand-600)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-brand)";
              }}
            >
              Access Your Portal
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Stats bar ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: EASE_OUT_EXPO }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            marginTop: 72,
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: "20px 16px",
                textAlign: "center",
                borderRight: i < stats.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div style={{
                fontSize: "var(--text-2xl)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--brand-600)",
                lineHeight: 1,
                marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Features ─────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 80,
            paddingBottom: 100,
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                style={{
                  padding: "28px 28px",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  transition: `
                    box-shadow var(--duration-base) var(--ease-out-expo),
                    transform var(--duration-base) var(--ease-out-expo),
                    border-color var(--duration-base) var(--ease-out-expo)
                  `,
                  cursor: "default",
                }}
                whileHover={{
                  y: -3,
                  boxShadow: "var(--shadow-lg)",
                  borderColor: "var(--brand-200)",
                }}
              >
                {/* Icon — not the cliché tile, just a clean inline icon */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <Icon
                    size={18}
                    strokeWidth={2}
                    style={{ color: "var(--brand-500)", flexShrink: 0 }}
                  />
                  <h3 style={{
                    fontSize: "var(--text-base)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    margin: 0,
                  }}>
                    {feature.title}
                  </h3>
                </div>
                <p style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-tertiary)",
                  lineHeight: 1.65,
                  margin: 0,
                  fontWeight: 400,
                }}>
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
