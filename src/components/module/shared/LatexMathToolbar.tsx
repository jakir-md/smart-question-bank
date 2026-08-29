/**
 * @file LatexMathToolbar.tsx
 * @description Quick math symbol & formula insertion toolbar for Rich Text & LaTeX fields.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface LatexMathToolbarProps {
  onInsert: (formula: string) => void;
  className?: string;
}

interface FormulaPreset {
  label: string;
  snippet: string;
  tooltip: string;
}

const MATH_CATEGORIES: { name: string; presets: FormulaPreset[] }[] = [
  {
    name: "Basic Math",
    presets: [
      { label: "a/b", snippet: "$\\frac{a}{b}$", tooltip: "Fraction (\\frac{a}{b})" },
      { label: "x²", snippet: "$x^{2}$", tooltip: "Exponent / Power (x^{2})" },
      { label: "xₙ", snippet: "$x_{n}$", tooltip: "Subscript (x_{n})" },
      { label: "√x", snippet: "$\\sqrt{x}$", tooltip: "Square Root (\\sqrt{x})" },
      { label: "ⁿ√x", snippet: "$\\sqrt[n]{x}$", tooltip: "N-th Root (\\sqrt[n]{x})" },
      { label: "v⃗", snippet: "$\\vec{v}$", tooltip: "Vector (\\vec{v})" },
      { label: "±", snippet: "$\\pm$", tooltip: "Plus-Minus (\\pm)" },
      { label: "×", snippet: "$\\times$", tooltip: "Multiplication (\\times)" },
      { label: "÷", snippet: "$\\div$", tooltip: "Division (\\div)" },
      { label: "≈", snippet: "$\\approx$", tooltip: "Approximately (\\approx)" },
      { label: "≠", snippet: "$\\neq$", tooltip: "Not Equal (\\neq)" },
      { label: "≤", snippet: "$\\le$", tooltip: "Less than or equal (\\le)" },
      { label: "≥", snippet: "$\\ge$", tooltip: "Greater than or equal (\\ge)" },
      { label: "∞", snippet: "$\\infty$", tooltip: "Infinity (\\infty)" },
    ],
  },
  {
    name: "Greek Symbols",
    presets: [
      { label: "θ", snippet: "$\\theta$", tooltip: "Theta (\\theta)" },
      { label: "π", snippet: "$\\pi$", tooltip: "Pi (\\pi)" },
      { label: "α", snippet: "$\\alpha$", tooltip: "Alpha (\\alpha)" },
      { label: "β", snippet: "$\\beta$", tooltip: "Beta (\\beta)" },
      { label: "γ", snippet: "$\\gamma$", tooltip: "Gamma (\\gamma)" },
      { label: "Δ", snippet: "$\\Delta$", tooltip: "Delta (\\Delta)" },
      { label: "λ", snippet: "$\\lambda$", tooltip: "Lambda (\\lambda)" },
      { label: "μ", snippet: "$\\mu$", tooltip: "Mu (\\mu)" },
      { label: "ω", snippet: "$\\omega$", tooltip: "Omega (\\omega)" },
      { label: "Ω", snippet: "$\\Omega$", tooltip: "Ohm / Capital Omega (\\Omega)" },
      { label: "ρ", snippet: "$\\rho$", tooltip: "Density / Rho (\\rho)" },
      { label: "σ", snippet: "$\\sigma$", tooltip: "Sigma (\\sigma)" },
    ],
  },
  {
    name: "Calculus & Science",
    presets: [
      { label: "∫", snippet: "$\\int_{a}^{b} f(x)\\,dx$", tooltip: "Definite Integral" },
      { label: "∑", snippet: "$\\sum_{i=1}^{n} x_i$", tooltip: "Summation (\\sum)" },
      { label: "lim", snippet: "$\\lim_{x \\to 0}$", tooltip: "Limit (\\lim)" },
      { label: "d/dx", snippet: "$\\frac{d}{dx}(f(x))$", tooltip: "Derivative" },
      { label: "→", snippet: "$\\rightarrow$", tooltip: "Right Arrow (\\rightarrow)" },
      { label: "⇌", snippet: "$\\rightleftharpoons$", tooltip: "Equilibrium Arrow" },
      { label: "°C", snippet: "$^\\circ\\text{C}$", tooltip: "Degree Celsius" },
      { label: "m/s²", snippet: "$\\text{m/s}^2$", tooltip: "Acceleration Unit" },
      { label: "Block $$", snippet: "$$\n\\text{Equation here}\n$$", tooltip: "Block Math Equation" },
    ],
  },
];

export function LatexMathToolbar({ onInsert, className = "" }: LatexMathToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className={`rounded-xl border border-border/60 bg-muted/30 p-1.5 text-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 pb-1">
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground text-[11px]">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Quick Math / LaTeX Insert:</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex rounded-lg border bg-background/60 p-0.5">
            {MATH_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(idx)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  activeCategory === idx
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 px-1.5 text-[10px] text-muted-foreground"
            title={expanded ? "Show fewer symbols" : "Show all categories"}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-1 pt-1">
        {(expanded ? MATH_CATEGORIES.flatMap((c) => c.presets) : MATH_CATEGORIES[activeCategory].presets).map(
          (preset) => (
            <button
              key={preset.label + preset.snippet}
              type="button"
              onClick={() => onInsert(preset.snippet)}
              title={preset.tooltip}
              className="group flex h-6 min-w-6 items-center justify-center rounded-md border border-border/80 bg-background px-1.5 text-[11px] font-mono font-medium text-foreground shadow-2xs hover:border-primary/60 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
