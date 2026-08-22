import { useState } from "react";
import { Check, X, ChevronDown, ArrowRight } from "lucide-react";
import "../App.css";

const plans = [
  {
    name: "Starter",
    tagline: "For personal projects",
    price: { monthly: 0, yearly: 0 },
    cta: "Get started free",
    highlight: false,
    dotColor: "bg-blue-500",
    features: [
      { text: "2 active workspaces", included: true },
      { text: "30s spin up time", included: true },
      { text: "No persistent storage", included: false },
    ],
  },
  {
    name: "Pro",
    tagline: "Ship every day",
    price: { monthly: 12, yearly: 9 },
    cta: "Start building",
    highlight: true,
    dotColor: "bg-orange-500",
    features: [
      { text: "10 active workspaces", included: true },
      { text: "Workspaces never sleep", included: true },
      { text: "Priority instance assignment", included: true },
    ],
  },
  {
    name: "Team",
    tagline: "Collaborate at scale",
    price: { monthly: 29, yearly: 22 },
    cta: "Start with team",
    highlight: false,
    dotColor: "bg-purple-500",
    features: [
      { text: "Unlimited workspaces", included: true },
      { text: "Dedicated EC2 instances", included: true },
    ],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="w-full relative py-20 px-4 md:px-8 bg-[#09090b]">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-r from-orange-500/10 via-purple-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Billing Toggle Switch */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-zinc-900 border border-zinc-800 mb-16 shadow-lg">
          <button
            onClick={() => setYearly(false)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !yearly
                ? "bg-white text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              yearly
                ? "bg-white text-zinc-950 shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Yearly</span>
            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-orange-500/30">
              SAVE 25%
            </span>
          </button>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch max-w-5xl mb-24">
          {plans.map((plan) => {
            const price = yearly ? plan.price.yearly : plan.price.monthly;

            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlight
                    ? "bg-white text-zinc-900 border-2 border-orange-500 shadow-[0_20px_60px_rgba(249,115,22,0.3)] md:-translate-y-3 z-10"
                    : "bg-white text-zinc-900 border border-zinc-200 shadow-xl hover:shadow-2xl"
                }`}
              >
                {/* Most Popular Tag for Pro Plan */}
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md border border-orange-400/50">
                    ✦ MOST POPULAR
                  </div>
                )}

                <div>
                  {/* Header & Dot Indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                    <div className={`w-2.5 h-2.5 rounded-full ${plan.dotColor}`} />
                  </div>

                  <p className="text-zinc-500 text-xs font-medium mb-6">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-zinc-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-zinc-500">$</span>
                      <span className="text-5xl font-black text-zinc-950 tracking-tight">
                        {price}
                      </span>
                      <span className="text-zinc-500 text-xs font-medium">/mo</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] mt-2">
                      {plan.price.monthly === 0
                        ? "Always free, no card needed"
                        : yearly
                        ? `Billed $${plan.price.yearly * 12}/year — save $${
                            (plan.price.monthly - plan.price.yearly) * 12
                          }`
                        : "Billed monthly, cancel anytime"}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mb-8 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 hover:scale-[1.02]"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    {plan.highlight && <ArrowRight className="w-3.5 h-3.5" />}
                    {!plan.highlight && plan.name === "Team" && (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Features List */}
                  <div className="space-y-3.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            f.included
                              ? plan.highlight
                                ? "bg-orange-500 text-white"
                                : "bg-zinc-900 text-white"
                              : "bg-zinc-100 text-zinc-400"
                          }`}
                        >
                          {f.included ? (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          ) : (
                            <X className="w-2.5 h-2.5 stroke-[3]" />
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            f.included
                              ? "text-zinc-700 font-medium"
                              : "text-zinc-400 line-through"
                          }`}
                        >
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion Section */}
        <div className="w-full max-w-2xl text-center">
          <p className="text-amber-500 text-xs font-extrabold tracking-widest uppercase mb-6">
            FREQUENTLY ASKED QUESTIONS
          </p>

          <div className="space-y-3 text-left mb-8">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts. Cancel from your dashboard instantly, effective immediately.",
              },
              {
                q: "What happens to my projects?",
                a: "All projects are saved securely to cloud storage. You get 30 days to export after cancellation.",
              },
              {
                q: "Can I switch plans?",
                a: "Upgrade or downgrade anytime. Changes take effect immediately with prorated billing.",
              },
              {
                q: "Student discount?",
                a: "Yes — email us with your .edu address and get 50% off Pro forever.",
              },
            ].map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={item.q}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/60 transition-all overflow-hidden cursor-pointer"
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                    <span className="text-zinc-200 text-sm font-semibold">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? "rotate-180 text-amber-400" : ""
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 text-zinc-400 text-xs leading-relaxed border-t border-zinc-800/40 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-zinc-500 text-xs">
            Questions?{" "}
            <span className="text-amber-400 font-semibold cursor-pointer hover:underline">
              Talk to our team
            </span>{" "}
            — we're available 24/7.
          </p>
        </div>
      </div>
    </section>
  );
}