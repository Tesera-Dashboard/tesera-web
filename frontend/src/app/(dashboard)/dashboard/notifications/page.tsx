"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, CheckCheck, Trash2, Package, Truck, AlertCircle, CheckCircle, Info, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Notification } from "@/types/notification";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/notifications");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Bildirimler yüklenirken hata oluştu");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error("Unexpected data format:", data);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Bildirimler yüklenirken hata:", err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetchWithAuth(`/notifications/${notificationId}/mark-read`, {
        method: "PUT",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Bildirim okundu işaretlenemedi");
      }

      toast.success("Bildirim okundu olarak işaretlendi");
      loadNotifications();
    } catch (err: any) {
      console.error("Mark as read error:", err);
      toast.error(`Bildirim okundu işaretlenemedi: ${err.message}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetchWithAuth("/notifications/mark-all-read", {
        method: "PUT",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Tüm bildirimler okundu işaretlenemedi");
      }

      toast.success("Tüm bildirimler okundu olarak işaretlendi");
      loadNotifications();
    } catch (err: any) {
      console.error("Mark all as read error:", err);
      toast.error(`Tüm bildirimler okundu işaretlenemedi: ${err.message}`);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const res = await fetchWithAuth(`/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Bildirim silinemedi");
      }

      toast.success("Bildirim başarıyla silindi");
      loadNotifications();
    } catch (err: any) {
      console.error("Delete notification error:", err);
      toast.error(`Bildirim silinemedi: ${err.message}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "shipment":
        return <Truck className="h-5 w-5 text-green-600" />;
      case "inventory":
        return <Package className="h-5 w-5 text-orange-600" />;
      case "workflow":
        return <Workflow className="h-5 w-5 text-purple-600" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "error":
        return <Badge variant="destructive" className="text-xs">Hata</Badge>;
      case "warning":
        return <Badge variant="secondary" className="text-xs bg-orange-500 text-white">Uyarı</Badge>;
      case "success":
        return <Badge variant="default" className="text-xs bg-green-600">Başarılı</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Bilgi</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Bildirimler"
          description={`${notifications.length} bildirim (${unreadCount} okunmamış)`}
        />
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz bildirim yok</h3>
          <p className="text-sm text-muted-foreground">
            Bildirimleriniz burada görüntülenecek.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 hover:bg-accent/50 transition-colors ${
                !notification.is_read ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-sm ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getPriorityBadge(notification.priority)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString("tr-TR")}
                    </p>
                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-7 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Okundu
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
