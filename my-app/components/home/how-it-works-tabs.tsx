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
              className={[
                "rounded-full border border-border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isActive
                  ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg"
                  : "bg-surface/80 text-muted hover:bg-primary-50 dark:bg-surface/30 dark:hover:bg-surface/40",
              ].join(" ")}
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
          <p className="max-w-2xl text-base text-muted">{track.caption}</p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {track.steps.map((step, index) => (
              <li
                key={step.title}
                className={[
                  "rounded-2xl border border-border bg-gradient-to-br p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl",
                  index === 0
                    ? "from-primary-600/15 via-surface to-primary-500/10"
                    : index === 1
                      ? "from-accent-500/15 via-surface to-accent-500/8"
                      : "from-success-600/15 via-surface to-info-600/10",
                  "dark:from-surface/25 dark:via-surface/15 dark:to-surface/20",
                ].join(" ")}
              >
                <span className="text-sm font-semibold text-primary-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-text">{step.title}</h3>
                <p className="mt-3 text-sm text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
