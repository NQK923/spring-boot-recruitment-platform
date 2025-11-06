"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { ChangeEvent } from "react";
import { cx } from "@/lib/cx";

type CompanyOption = {
  id: number;
  name: string;
};

type SuperAdminCompanySwitcherProps = {
  companies: CompanyOption[];
  selectedCompanyId: number | null;
  className?: string;
};

export function SuperAdminCompanySwitcher({
  companies,
  selectedCompanyId,
  className,
}: SuperAdminCompanySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const value = selectedCompanyId ? String(selectedCompanyId) : "";
  const options = useMemo(() => companies.map((company) => ({
    id: company.id,
    name: company.name,
  })), [companies]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString());
      if (nextValue) {
        params.set("companyId", nextValue);
      } else {
        params.delete("companyId");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={options.length === 0 || isPending}
      className={cx(
        "h-10 min-w-[220px] rounded-2xl border border-border/70 bg-surface/98 px-3 text-sm font-semibold text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.22)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {options.length === 0 ? (
        <option value="">Chưa có công ty nào</option>
      ) : (
        <>
          <option value="">Chọn công ty</option>
          {options.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </>
      )}
    </select>
  );
}
