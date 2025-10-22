"use client";
 
 import Link from "next/link";
 import { usePathname } from "next/navigation";
 import { ROUTES } from "@/lib/routes";
 
 const navigation = [
   { href: ROUTES.home, label: "Home" },
   { href: ROUTES.candidatePortal, label: "Candidate" },
   { href: ROUTES.recruiterDashboard, label: "Recruiter" },
   { href: ROUTES.docs, label: "Docs" },
 ];
 
 export function SiteNavbar() {
   const pathname = usePathname();
 
   return (
     <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 sm:flex">
       {navigation.map((item) => {
         const active =
           item.href === ROUTES.home ? pathname === ROUTES.home : pathname.startsWith(item.href);
         return (
           <Link
             key={item.href}
             href={item.href}
             className={`transition hover:text-foreground ${
               active ? "text-foreground" : "text-foreground/80"
             }`}
           >
             {item.label}
           </Link>
         );
       })}
     </nav>
   );
 }
