"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SiteNavbar } from "@/components/layout/site-navbar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const canUseDom = typeof document !== "undefined";

  useEffect(() => {
    if (!canUseDom) {
      return;
    }
    if (!open) {
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.style.setProperty("overflow", "hidden");
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open, canUseDom]);

  const toggleButton = (
    <button
      type="button"
      aria-label="Toggle navigation"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-xs font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm transition hover:border-border/80 hover:shadow-md sm:hidden"
      onClick={() => setOpen((prev) => !prev)}
    >
      {open ? "Close" : "Menu"}
    </button>
  );

  if (!canUseDom) {
    return toggleButton;
  }

  return (
    <>
      {toggleButton}
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm sm:hidden">
              <div className="absolute inset-x-4 top-4 rounded-2xl border border-foreground/10 bg-surface px-5 py-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                    Navigation
                  </span>
                  <button
                    type="button"
                    aria-label="Close navigation"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-border/80 hover:shadow-md"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="mt-6">
                  <SiteNavbar orientation="vertical" onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
