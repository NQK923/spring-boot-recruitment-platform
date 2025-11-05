import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/current-user";

function describePrimaryRole(roles: string[] | undefined) {
  if (!roles || roles.length === 0) {
    return null;
  }
  if (roles.includes("SUPER_ADMIN")) return "Quản trị cấp cao";
  if (roles.includes("COMPANY_ADMIN")) return "Quản trị viên công ty";
  if (roles.includes("RECRUITER")) return "Nhà tuyển dụng";
  if (roles.includes("CANDIDATE")) return "Ứng viên";
  return roles[0];
}

export async function NavigationActions() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="flex items-center gap-3">
        <Link href={ROUTES.signIn} className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm">
            Đăng nhập
          </Button>
        </Link>
        <Link href={ROUTES.register}>
          <Button size="sm">Bắt đầu ngay</Button>
        </Link>
      </div>
    );
  }

  const roleLabel = describePrimaryRole(currentUser.roles);
  const emailLabel = currentUser.email || "Người dùng đã xác thực";

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

