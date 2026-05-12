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
  FlaskConical,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchWithAuth } from "@/lib/api";

const navGroups = [
  {
    label: "Temel",
    items: [
      { label: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard, id: 1 },
      { label: "YZ Asistanı", href: "/dashboard/ai-assistant", icon: Bot, id: 2 },
      { label: "Siparişler", href: "/dashboard/orders", icon: ShoppingCart, id: 3 },
      { label: "Envanter", href: "/dashboard/inventory", icon: Box, id: 4 },
      { label: "Kargolar", href: "/dashboard/shipments", icon: Truck, id: 5 },
      { label: "İş Akışları", href: "/dashboard/workflows", icon: Workflow, id: 6 },
    ]
  },
  {
    label: "İçgörüler",
    items: [
      { label: "Analitik", href: "/dashboard/analytics", icon: BarChart3, id: 7 },
      { label: "Bildirimler", href: "/dashboard/notifications", icon: Bell, id: 8 },
    ]
  },
  {
    label: "Yönetim",
    items: [
      { label: "Entegrasyonlar", href: "/dashboard/integrations", icon: Plug, badge: "Yakında", id: 9 },
      { label: "Ekip", href: "/dashboard/team", icon: Users, badge: "Yakında", id: 10 },
      { label: "Ayarlar", href: "/dashboard/settings", icon: Settings, id: 11 },
    ]
  },
  {
    label: "Geliştirici Araçları",
    items: [
      { label: "Test Simülatörü", href: "/dashboard/test", icon: FlaskConical, id: 12 },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarEnabled, setSidebarEnabled] = useState<number[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchWithAuth("/settings/user-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.sidebar_enabled && data.sidebar_enabled.length > 0) {
            setSidebarEnabled(data.sidebar_enabled);
          } else {
            // Default to all enabled if not set or empty
            setSidebarEnabled(navGroups.flatMap(g => g.items.map(i => i.id)));
          }
        } else {
          // Default to all enabled on error
          setSidebarEnabled(navGroups.flatMap(g => g.items.map(i => i.id)));
        }
      } catch (err) {
        console.error("Failed to load sidebar settings:", err);
        // Default to all enabled on error
        setSidebarEnabled(navGroups.flatMap(g => g.items.map(i => i.id)));
      }
    };
    loadSettings();

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener("settings-updated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("settings-updated", handleSettingsUpdate);
    };
  }, []);

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
          {navGroups.map((group, index) => {
            const enabledItemsInGroup = group.items.filter(
              (item) => item.id && sidebarEnabled.includes(item.id)
            );
            
            // Skip rendering the group if no items are enabled
            if (enabledItemsInGroup.length === 0) return null;
            
            return (
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
                  {group.items
                    .filter((item) => item.id && sidebarEnabled.includes(item.id))
                    .map(({ label, href, icon: Icon, badge }) => {
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
                          {!collapsed && (
                            <div className="flex items-center gap-2 flex-1">
                              <span>{label}</span>
                              {badge && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                  {badge}
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
