"use client";

import { useState } from "react";

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type HowItWorksTrack = {
  id: string;
  label: string;
  caption: string;
  steps: HowItWorksStep[];
};

type HowItWorksTabsProps = {
  tracks: HowItWorksTrack[];
};

export function HowItWorksTabs({ tracks }: HowItWorksTabsProps) {
  const [activeId, setActiveId] = useState(() => tracks[0]?.id ?? "");

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {tracks.map((track) => {
          const isActive = track.id === activeId;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setActiveId(track.id)}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: isActive ? 'linear-gradient(to right, #4F46E5, #FF6B6B)' : 'transparent',
                color: isActive ? 'white' : undefined,
                boxShadow: isActive ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)' : undefined,
              }}
            >
              {track.label}
            </button>
          );
        })}
      </div>

      {tracks.map((track) => (
        <div
          key={track.id}
          className={track.id === activeId ? "mt-8 block" : "hidden"}
          aria-live="polite"
        >
          <p className="max-w-2xl text-base text-muted mb-8">{track.caption}</p>
          <ol className="grid gap-6 md:grid-cols-3">
            {track.steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-3xl border-2 border-border bg-surface p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl overflow-hidden group"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: index === 0
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(165, 180, 252, 0.05))"
                      : index === 1
                        ? "linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(252, 165, 165, 0.05))"
                        : "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(110, 231, 183, 0.05))",
                  }}
                />
                <div className="relative space-y-4">
                  <span 
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
                    style={{
                      backgroundColor: index === 0 ? "#4F46E5" : index === 1 ? "#EE5A52" : "#059669"
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-bold text-text leading-tight">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
