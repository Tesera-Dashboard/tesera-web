"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  ShoppingCart,
  Box,
  Truck,
  Workflow,
  BarChart3,
  Bell,
  Plug,
  Users,
  Settings,
  ChevronLeft,
  Package,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navGroups = [
  {
    label: "Temel",
    items: [
      { label: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
      { label: "YZ Asistanı", href: "/dashboard/ai-assistant", icon: Bot },
      { label: "Siparişler", href: "/dashboard/orders", icon: ShoppingCart },
      { label: "Envanter", href: "/dashboard/inventory", icon: Box },
      { label: "Kargolar", href: "/dashboard/shipments", icon: Truck },
      { label: "İş Akışları", href: "/dashboard/workflows", icon: Workflow },
    ]
  },
  {
    label: "İçgörüler",
    items: [
      { label: "Analitik", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Bildirimler", href: "/dashboard/notifications", icon: Bell },
    ]
  },
  {
    label: "Yönetim",
    items: [
      { label: "Entegrasyonlar", href: "/dashboard/integrations", icon: Plug },
      { label: "Ekip", href: "/dashboard/team", icon: Users },
      { label: "Ayarlar", href: "/dashboard/settings", icon: Settings },
    ]
  },
  {
    label: "Geliştirici Araçları",
    items: [
      { label: "Test Simülatörü", href: "/dashboard/test", icon: FlaskConical },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-sidebar-border shrink-0">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 mx-auto"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <Image src="/mini-logo.png" alt="Tesera" width={40} height={40} className="h-8 w-8 object-contain dark:invert" />
          </Button>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Tesera Logo" width={400} height={120} className="w-[160px] h-auto object-contain dark:invert" priority />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
            </Button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-2">
        <ul className="space-y-6">
          {navGroups.map((group, index) => (
            <li key={index} className="flex flex-col gap-1">
              {!collapsed && (
                <div className="px-3 mb-1 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  {group.label}
                </div>
              )}
              {collapsed && index !== 0 && (
                <div className="flex justify-center mb-2 mt-4">
                  <div className="w-6 h-px bg-sidebar-border"></div>
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                          collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? label : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        <Separator className="mb-2 bg-sidebar-border" />
        <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg", collapsed && "justify-center")}>
          <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">Acme Corp</p>
              <p className="text-xs text-muted-foreground truncate">admin@acme.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
