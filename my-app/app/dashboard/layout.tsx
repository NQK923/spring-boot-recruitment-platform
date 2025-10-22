import { redirect } from "next/navigation";
import { getAccessTokenFromCookies } from "@/lib/session";
import { ROUTES } from "@/lib/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = getAccessTokenFromCookies();
  if (!token) {
    redirect(`${ROUTES.signIn}?next=${ROUTES.recruiterDashboard}`);
  }
  return <>{children}</>;
}
