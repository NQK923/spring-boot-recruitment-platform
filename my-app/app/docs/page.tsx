export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Platform documentation</h1>
        <p className="text-sm text-foreground/70">
          Centralize guidance for recruiters, admins, and candidates. Replace this content with real docs
          or link to your documentation portal.
        </p>
      </header>
      <section className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm">
        <p className="text-sm text-foreground/60">
          Coming soon: API references, onboarding checklists, and FAQ for each role.
        </p>
      </section>
    </div>
  );
}
