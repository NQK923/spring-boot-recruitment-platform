import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";

function describePrimaryRole(roles: string[] | undefined) {
  if (!roles || roles.length === 0) {
    return null;
  }
  if (roles.includes("SUPER_ADMIN")) return "Super Admin";
  if (roles.includes("COMPANY_ADMIN")) return "Company Admin";
  if (roles.includes("RECRUITER")) return "Recruiter";
  if (roles.includes("CANDIDATE")) return "Candidate";
  return roles[0];
}

export async function NavigationActions() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="flex items-center gap-3">
        <Link href={ROUTES.signIn} className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link href={ROUTES.register}>
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  const roleLabel = describePrimaryRole(currentUser.roles);
  const emailLabel = currentUser.email || "Authenticated user";

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="hidden flex-col text-right sm:flex">
        <span className="font-medium text-foreground">{emailLabel}</span>
        {roleLabel ? (
          <span className="text-xs text-foreground/60">{roleLabel}</span>
        ) : null}
      </div>
      <AccountMenu />
    </div>
  );
}

