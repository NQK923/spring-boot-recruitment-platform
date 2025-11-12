"use client";

import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
  summary?: ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
};

export function CollapsibleSection({
  icon,
  title,
  description,
  children,
  defaultOpen = false,
  summary,
  gradientFrom = "from-blue-500",
  gradientTo = "to-indigo-600",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-lg shadow-gray-200/50 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
        >
          {isOpen ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Thu gọn
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </>
          )}
        </button>
      </div>

      {!isOpen && summary && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
          {summary}
        </div>
      )}

      {isOpen && <div className="pt-2">{children}</div>}
    </section>
  );
}
