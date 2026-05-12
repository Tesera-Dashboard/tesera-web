"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon, Package, Truck, Workflow, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
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

export function Topbar({ pageTitle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetchWithAuth("/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Notifications load error:", err);
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
      await fetchWithAuth("/notifications/mark-all-read", { method: "PUT" });
      loadNotifications();
      toast.success("Tüm bildirimler okundu işaretlendi");
    } catch (err) {
      console.error("Mark all as read error:", err);
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

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 gap-4">
      {/* Title */}
      <h1 className="text-base font-semibold mr-auto">{pageTitle ?? "Panel"}</h1>

      {/* Search */}
      <div className="relative hidden md:block w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Ara..."
          className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger className="relative h-8 w-8 p-0 border-0 bg-transparent hover:bg-accent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
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

      {/* Theme toggle */}
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

      {/* User menu */}
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
          <DropdownMenuItem>Profil</DropdownMenuItem>
          <DropdownMenuItem>Ayarlar</DropdownMenuItem>
          <DropdownMenuItem>Faturalandırma</DropdownMenuItem>
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
