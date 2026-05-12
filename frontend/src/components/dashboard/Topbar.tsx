"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon, Package, Truck, Workflow, AlertCircle, CheckCircle, Trash2, Box, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types/notification";

interface TopbarProps {
  pageTitle?: string;
}

interface Route {
  label: string;
  href: string;
  icon: any;
}

export function Topbar({ pageTitle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Route[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const routes: Route[] = [
    { label: "Genel Bakış", href: "/dashboard", icon: ArrowRight },
    { label: "YZ Asistanı", href: "/dashboard/ai-assistant", icon: ArrowRight },
    { label: "Siparişler", href: "/dashboard/orders", icon: ArrowRight },
    { label: "Envanter", href: "/dashboard/inventory", icon: ArrowRight },
    { label: "Kargolar", href: "/dashboard/shipments", icon: ArrowRight },
    { label: "İş Akışları", href: "/dashboard/workflows", icon: ArrowRight },
    { label: "Analitik", href: "/dashboard/analytics", icon: ArrowRight },
    { label: "Bildirimler", href: "/dashboard/notifications", icon: ArrowRight },
    { label: "Entegrasyonlar", href: "/dashboard/integrations", icon: ArrowRight },
    { label: "Ekip", href: "/dashboard/team", icon: ArrowRight },
    { label: "Ayarlar", href: "/dashboard/settings", icon: ArrowRight },
    { label: "Test Simülatörü", href: "/dashboard/test", icon: ArrowRight },
  ];

  useEffect(() => {
    getCurrentUser().then(data => {
      if (data) {
        if (!data.is_verified) {
          router.push("/pending-verification");
          return;
        }
        setUser(data);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchWithAuth("/settings/user-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.notifications_enabled !== undefined) {
            setNotificationsEnabled(data.notifications_enabled);
          }
        }
      } catch (err) {
        console.error("Failed to load notifications setting:", err);
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

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        loadNotifications();
      }
    }, 30000); // Refresh every 30s only if enabled
    
    // Listen for custom notification refresh events
    const handleNotificationRefresh = (event: any) => {
      console.log("Notification refresh event received:", event.detail);
      if (notificationsEnabled) {
        loadNotifications();
      }
    };
    
    window.addEventListener("notification-refresh", handleNotificationRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("notification-refresh", handleNotificationRefresh);
    };
  }, [notificationsEnabled]);

  const loadNotifications = async () => {
    try {
      // Fetch unread count separately to get accurate count
      const countRes = await fetchWithAuth("/notifications/unread-count");
      if (countRes.ok) {
        const countData = await countRes.json();
        const unreadCount = countData.count || 0;
        console.log("Unread count from API:", unreadCount);
        setUnreadCount(unreadCount);
      }

      // Fetch notifications for dropdown display (limit to 5)
      const res = await fetchWithAuth("/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error("Unexpected data format:", data);
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error("Notifications load error:", err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetchWithAuth(`/notifications/${notificationId}/mark-read`, { method: "PUT" });
      loadNotifications();
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetchWithAuth("/notifications/mark-all-read", { method: "PUT" });
      if (res.ok) {
        // Immediately update unread count to 0 for instant UI feedback
        setUnreadCount(0);
        // Mark all current notifications as read locally
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        toast.success("Tüm bildirimler okundu işaretlendi");
        // Reload from server to ensure consistency
        await loadNotifications();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.message || "İşlem başarısız");
      }
    } catch (err) {
      console.error("Mark all as read error:", err);
      toast.error("Tüm bildirimler okundu işaretlenemedi");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "shipment":
        return <Truck className="h-4 w-4 text-green-600" />;
      case "workflow":
        return <Workflow className="h-4 w-4 text-purple-600" />;
      case "inventory":
        return <Box className="h-4 w-4 text-orange-600" />;
      case "system":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Başarıyla çıkış yapıldı");
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const filtered = routes.filter(
        (route) =>
          route.label.toLowerCase().includes(query.toLowerCase()) ||
          route.href.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchDropdown(filtered.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleRouteSelect = (href: string) => {
    router.push(href);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 gap-4">
      {/* Search - left side */}
      <div className="relative hidden md:block w-56 search-container">
        <form onSubmit={handleSearch}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Sayfa ara..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSearchDropdown(searchResults.length > 0)}
            className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </form>
        
        {/* Search Results Dropdown */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {searchResults.map((route) => (
              <button
                key={route.href}
                onClick={() => handleRouteSelect(route.href)}
                className={`w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 transition-colors ${
                  pathname === route.href ? "bg-accent" : ""
                }`}
              >
                <route.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{route.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title - only show if provided */}
      {pageTitle && <h1 className="text-base font-semibold">{pageTitle}</h1>}

      {/* Spacer to push right elements to the right */}
      <div className="flex-1" />

      {/* Notifications - right side */}
      <DropdownMenu>
        <DropdownMenuTrigger className="relative h-8 w-8 p-0 border-0 bg-transparent hover:bg-accent rounded-md flex items-center justify-center">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
              {unreadCount > 5 ? "5+" : unreadCount}
            </Badge>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="font-semibold text-sm">Bildirimler</div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllAsRead}
              >
                Tümünü Oku
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Bildirim yok
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-3 cursor-pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-xs font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
            Tüm Bildirimleri Gör
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme toggle - right side */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {/* User menu - far right */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8 cursor-pointer" aria-label="User menu">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{user?.full_name || "Yükleniyor..."}</div>
            <div className="text-xs text-muted-foreground">{user?.email || ""}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings?tab=profile")}>
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings?tab=settings")}>
            Ayarlar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings?tab=billing")}>
            Faturalandırma
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
