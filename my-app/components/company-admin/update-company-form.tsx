"use client";

import { useActionState } from "react";
import { updateCompanyAction, type UpdateCompanyState } from "@/app/dashboard/company/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CompanyProfile = {
  name: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
};

const initialState: UpdateCompanyState = {};

export function UpdateCompanyForm({ profile }: { profile: CompanyProfile }) {
  const [state, formAction, pending] = useActionState(updateCompanyAction, initialState);

  return (
    <form className="space-y-4 text-sm" action={formAction}>
      <div className="space-y-2">
        <label htmlFor="company-name" className="font-semibold text-foreground">
          Company name
        </label>
        <Input
          id="company-name"
          name="name"
          defaultValue={profile.name}
          placeholder="Company name"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-website" className="font-semibold text-foreground">
          Website
        </label>
        <Input
          id="company-website"
          name="website"
          defaultValue={profile.website ?? ""}
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-logo" className="font-semibold text-foreground">
          Logo URL
        </label>
        <Input
          id="company-logo"
          name="logoUrl"
          defaultValue={profile.logoUrl ?? ""}
          placeholder="https://cdn.example.com/logo.png"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="company-description" className="font-semibold text-foreground">
          Description
        </label>
        <textarea
          id="company-description"
          name="description"
          defaultValue={profile.description ?? ""}
          placeholder="Share a brief overview that appears on job postings and internal dashboards."
          className="min-h-[96px] w-full rounded-2xl border border-border/70 bg-surface/98 px-4 py-3 text-sm text-foreground shadow-[0_6px_18px_rgba(var(--shadow-soft),0.22)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      {state?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
