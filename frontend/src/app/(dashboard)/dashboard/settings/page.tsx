"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, User, Settings, CreditCard, AlertTriangle, Edit2, Save, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchWithAuth } from "@/lib/api";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const { theme: currentAppTheme, setTheme: setAppTheme } = useTheme();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: "", tax_number: "", address: "" });
  const [saving, setSaving] = useState(false);
  
  // Settings state — initialize from current app theme instead of hardcoding "light"
  const [theme, setTheme] = useState(currentAppTheme || "light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const sidebarItems = [
    { id: 1, label: "Genel Bakış", href: "/dashboard", enabled: true, group: "Temel" },
    { id: 2, label: "YZ Asistanı", href: "/dashboard/ai-assistant", enabled: true, group: "Temel" },
    { id: 3, label: "Siparişler", href: "/dashboard/orders", enabled: true, group: "Temel" },
    { id: 4, label: "Envanter", href: "/dashboard/inventory", enabled: true, group: "Temel" },
    { id: 5, label: "Kargolar", href: "/dashboard/shipments", enabled: true, group: "Temel" },
    { id: 6, label: "İş Akışları", href: "/dashboard/workflows", enabled: true, group: "Temel" },
    { id: 7, label: "Analitik", href: "/dashboard/analytics", enabled: true, group: "İçgörüler" },
    { id: 8, label: "Bildirimler", href: "/dashboard/notifications", enabled: true, group: "İçgörüler" },
    { id: 9, label: "Entegrasyonlar", href: "/dashboard/integrations", enabled: true, group: "Yönetim" },
    { id: 10, label: "Ekip", href: "/dashboard/team", enabled: true, group: "Yönetim" },
    { id: 11, label: "Ayarlar", href: "/dashboard/settings", enabled: true, group: "Yönetim" },
    { id: 12, label: "Test Simülatörü", href: "/dashboard/test", enabled: true, group: "Geliştirici Araçları" },
  ];
  const [sidebarEnabled, setSidebarEnabled] = useState<number[]>([]);
  const [sidebarOrder, setSidebarOrder] = useState<number[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Password reset modal
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Account deletion modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [profileRes, settingsRes, billingRes] = await Promise.all([
        fetchWithAuth("/settings/profile"),
        fetchWithAuth("/settings/user-settings"),
        fetchWithAuth("/settings/billing"),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileData(data);
        setCompanyForm({
          name: data.company?.name || "",
          tax_number: data.company?.tax_number || "",
          address: data.company?.address || "",
        });
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettingsData(data);
        if (data.theme) {
          setTheme(data.theme);
          setAppTheme(data.theme);
        }
        if (data.sidebar_enabled && data.sidebar_enabled.length > 0) {
          setSidebarEnabled(data.sidebar_enabled);
        } else {
          setSidebarEnabled(sidebarItems.filter((i) => i.enabled).map((i) => i.id));
        }
        if (data.sidebar_order && data.sidebar_order.length > 0) {
          // Merge backend order with any missing IDs from sidebarItems
          const backendOrder = data.sidebar_order;
          const allIds = sidebarItems.map((i) => i.id);
          const missingIds = allIds.filter(id => !backendOrder.includes(id));
          setSidebarOrder([...backendOrder, ...missingIds]);
        } else {
          setSidebarOrder(sidebarItems.map((i) => i.id));
        }
        if (data.notifications_enabled !== undefined) setNotificationsEnabled(data.notifications_enabled);
        setSettingsLoaded(true);
      } else {
        // If settings endpoint fails, still set settingsLoaded to show default values
        setSidebarEnabled(sidebarItems.filter((i) => i.enabled).map((i) => i.id));
        setSidebarOrder(sidebarItems.map((i) => i.id));
        setSettingsLoaded(true);
      }
      if (billingRes.ok) setBillingData(await billingRes.json());
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth("/settings/profile/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      });

      if (res.ok) {
        toast.success("Şirket bilgileri güncellendi");
        loadAllData();
        setEditingCompany(false);
      } else {
        toast.error("Güncelleme başarısız");
      }
    } catch (err) {
      console.error("Failed to update company:", err);
      toast.error("Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }

    try {
      const res = await fetchWithAuth("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Şifre başarıyla değiştirildi");
        setPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Şifre değiştirme başarısız");
      }
    } catch (err) {
      console.error("Failed to reset password:", err);
      toast.error("Şifre değiştirme başarısız");
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== "HESABIMI SİL") {
      toast.error("Onay metni eşleşmiyor");
      return;
    }

    try {
      const res = await fetchWithAuth("/auth/delete-account", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Hesap başarıyla silindi");
        // Clear local session and redirect to home page
        logout();
        window.location.href = "/";
      } else {
        toast.error("Hesap silme başarısız");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      toast.error("Hesap silme başarısız");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetchWithAuth("/settings/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          notifications_enabled: notificationsEnabled,
          sidebar_enabled: sidebarEnabled,
          sidebar_order: sidebarOrder,
        }),
      });

      if (res.ok) {
        toast.success("Ayarlar kaydedildi");
        // Trigger sidebar refresh
        window.dispatchEvent(new CustomEvent("settings-updated"));
      } else {
        toast.error("Kaydetme başarısız");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Kaydetme başarısız");
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setAppTheme(newTheme);
    // Auto-save theme
    fetchWithAuth("/settings/user-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(console.error);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    // Auto-save notifications
    fetchWithAuth("/settings/user-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications_enabled: newValue }),
    }).catch(console.error);
  };

  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropId: number) => {
    if (draggedItem === null) return;
    
    const draggedItemObj = sidebarItems.find((i) => i.id === draggedItem);
    const dropItemObj = sidebarItems.find((i) => i.id === dropId);
    
    // Only allow reordering within the same group
    if (!draggedItemObj || !dropItemObj || draggedItemObj.group !== dropItemObj.group) {
      setDraggedItem(null);
      return;
    }
    
    const newOrder = [...sidebarOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const dropIndex = newOrder.indexOf(dropId);
    
    if (draggedIndex !== -1 && dropIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, draggedItem);
      setSidebarOrder(newOrder);
      // Auto-save order
      fetchWithAuth("/settings/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sidebar_order: newOrder }),
      }).catch(console.error);
    }
    
    setDraggedItem(null);
  };

  const plans = [
    {
      name: "Ücretsiz Deneme",
      price: "Ücretsiz",
      period: "14 gün",
      desc: "Tesera'yı ekibinizle keşfetmeniz için tam platform erişimi.",
      features: [
        "Tüm temel özellikler",
        "3 kullanıcıya kadar",
        "1.000 YZ mesajı",
        "Topluluk desteği",
      ],
      current: billingData?.plan === "free" || true,
    },
    {
      name: "Başlangıç",
      price: "$49",
      period: "/aylık",
      desc: "Butik e-ticaret ve küçük ekipler için mükemmel.",
      features: [
        "Ücretsiz plandaki her şey",
        "10 kullanıcıya kadar",
        "10.000 YZ mesajı",
        "E-posta ve canlı destek",
        "3 entegrasyon",
      ],
      comingSoon: true,
    },
    {
      name: "Büyüme",
      price: "$149",
      period: "/aylık",
      desc: "Karmaşık otomasyon ihtiyaçları olan ölçeklenen operasyonlar için.",
      features: [
        "Başlangıç planındaki her şey",
        "Sınırsız kullanıcı",
        "100.000 YZ mesajı",
        "Öncelikli destek",
        "Sınırsız entegrasyon",
        "Özel otomasyon kuralları",
        "Gelişmiş analitik",
      ],
      comingSoon: true,
    },
    {
      name: "Kurumsal",
      price: "Özel",
      period: "",
      desc: "Gelişmiş YZ ajanları, SLA'lar ve büyük ölçekli özel entegrasyonlar.",
      features: [
        "Büyüme planındaki her şey",
        "Özel atanmış YZ ajanları",
        "Size özel kurulum",
        "SSO ve gelişmiş güvenlik",
        "Özel SLA garantisi",
        "API öncelikli erişim",
      ],
      comingSoon: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader title="Ayarlar" description="Yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Ayarlar"
        description="Profilinizi, site ayarlarını ve faturalandırma bilginizi yönetin"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Faturalandırma
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Profil Bilgileri</h3>
                <p className="text-sm text-muted-foreground">
                  Profilinizin tamamlanma durumu: <span className="font-semibold text-primary">{profileData?.completion_percentage || 0}%</span>
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Tamamlanma: {profileData?.completion_percentage || 0}%
              </Badge>
            </div>

            <div className="space-y-6">
              {/* User Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Temel Bilgiler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ad Soyad</label>
                    <div className="p-3 bg-muted rounded-lg text-sm">{profileData?.user?.full_name || "Yükleniyor..."}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-posta</label>
                    <div className="p-3 bg-muted rounded-lg text-sm">{profileData?.user?.email || "Yükleniyor..."}</div>
                  </div>
                </div>
              </div>

              {/* Company Info Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Şirket Bilgileri</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (editingCompany) {
                        setEditingCompany(false);
                        setCompanyForm({
                          name: profileData?.company?.name || "",
                          tax_number: profileData?.company?.tax_number || "",
                          address: profileData?.company?.address || "",
                        });
                      } else {
                        setEditingCompany(true);
                      }
                    }}
                  >
                    {editingCompany ? (
                      <>İptal</>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Düzenle
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Organizasyon Adı</Label>
                    {editingCompany ? (
                      <Input
                        id="company-name"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        placeholder="Organizasyon adı girin"
                      />
                    ) : (
                      <div className={`p-3 bg-muted rounded-lg text-sm ${!profileData?.company?.name ? "border border-dashed" : ""}`}>
                        {profileData?.company?.name || <span className="text-muted-foreground">Henüz girilmedi</span>}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-number">Vergi Numarası</Label>
                    {editingCompany ? (
                      <Input
                        id="tax-number"
                        value={companyForm.tax_number}
                        onChange={(e) => setCompanyForm({ ...companyForm, tax_number: e.target.value })}
                        placeholder="Vergi numarası girin"
                      />
                    ) : (
                      <div className={`p-3 bg-muted rounded-lg text-sm ${!profileData?.company?.tax_number ? "border border-dashed" : ""}`}>
                        {profileData?.company?.tax_number || <span className="text-muted-foreground">Henüz girilmedi</span>}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adres</Label>
                    {editingCompany ? (
                      <Input
                        id="address"
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        placeholder="Adres girin"
                      />
                    ) : (
                      <div className={`p-3 bg-muted rounded-lg text-sm ${!profileData?.company?.address ? "border border-dashed" : ""}`}>
                        {profileData?.company?.address || <span className="text-muted-foreground">Henüz girilmedi</span>}
                      </div>
                    )}
                  </div>
                </div>
                {editingCompany && (
                  <Button onClick={handleSaveCompany} disabled={saving}>
                    <Save className="h-4 w-4 mr-1" />
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                )}
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Tehlikeli Bölge
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <button
                      onClick={() => setPasswordDialogOpen(true)}
                      className="p-3 bg-muted rounded-lg text-sm text-left hover:bg-muted/80 transition-colors"
                    >
                      <p className="font-medium">Şifre Değiştir</p>
                      <p className="text-xs text-muted-foreground mt-1">Hesap şifrenizi değiştirin</p>
                    </button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Şifre Değiştir</DialogTitle>
                        <DialogDescription>
                          Yeni şifrenizi girin. En az 6 karakter olmalıdır.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Mevcut Şifre</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Mevcut şifrenizi girin"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Yeni Şifre</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Yeni şifrenizi girin"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Şifre Onayla</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                          İptal
                        </Button>
                        <Button onClick={handlePasswordReset}>
                          Şifre Değiştir
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <button
                      onClick={() => setDeleteDialogOpen(true)}
                      className="p-3 bg-destructive/10 rounded-lg text-sm text-left hover:bg-destructive/20 transition-colors text-destructive"
                    >
                      <p className="font-medium">Hesabı Sil</p>
                      <p className="text-xs text-destructive/80 mt-1">Hesabınızı kalıcı olarak silin</p>
                    </button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-destructive">Hesabı Sil</DialogTitle>
                        <DialogDescription>
                          Bu işlem geri alınamaz. Hesabınızı silmek istediğinizden emin misiniz?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center space-y-4 py-4">
                        <img src="/warning.png" alt="Uyarı" className="w-24 h-24 object-contain" />
                        <div className="space-y-2 w-full">
                          <Label htmlFor="delete-confirmation">
                            Onaylamak için <span className="font-bold">HESABIMI SİL</span> yazın
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="HESABIMI SİL"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          İptal
                        </Button>
                        <Button variant="destructive" onClick={handleAccountDeletion}>
                          Hesabı Sil
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Site Ayarları</h3>
              <Button onClick={handleSaveSettings} size="sm">
                Kaydet
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Theme Setting */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Tema</p>
                  <p className="text-xs text-muted-foreground mt-1">Açık veya koyu tema seçin</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("light")}
                  >
                    Açık
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("dark")}
                  >
                    Koyu
                  </Button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Bildirimler</p>
                  <p className="text-xs text-muted-foreground mt-1">Bildirimleri açın veya kapatın</p>
                </div>
                <Button
                  variant={notificationsEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleNotificationsToggle}
                >
                  {notificationsEnabled ? "Açık" : "Kapalı"}
                </Button>
              </div>

              {/* Sidebar Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Yan Menü Öğeleri</h4>
                {!settingsLoaded ? (
                  <p className="text-xs text-muted-foreground">Yükleniyor...</p>
                ) : (
                  <>
                    {["Temel", "İçgörüler", "Yönetim", "Geliştirici Araçları"].map((groupName) => (
                      <div key={groupName} className="space-y-2">
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {groupName}
                        </h5>
                        <div className="space-y-2">
                          {sidebarOrder
                            .map((id) => sidebarItems.find((i) => i.id === id))
                            .filter((item): item is NonNullable<typeof item> => item?.group === groupName)
                            .map((item) => {
                              const isEnabled = sidebarEnabled.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={() => handleDragStart(item.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={() => handleDrop(item.id)}
                                  className={`flex items-center justify-between p-3 bg-muted rounded-lg cursor-move ${
                                    draggedItem === item.id ? "opacity-50" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{item.label}</span>
                                  </div>
                                  <Button
                                    variant={isEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      if (isEnabled) {
                                        setSidebarEnabled(sidebarEnabled.filter((id) => id !== item.id));
                                        // Auto-save
                                        fetchWithAuth("/settings/user-settings", {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            sidebar_enabled: sidebarEnabled.filter((id) => id !== item.id),
                                          }),
                                        }).catch(console.error);
                                      } else {
                                        setSidebarEnabled([...sidebarEnabled, item.id]);
                                        // Auto-save
                                        fetchWithAuth("/settings/user-settings", {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            sidebar_enabled: [...sidebarEnabled, item.id],
                                          }),
                                        }).catch(console.error);
                                      }
                                    }}
                                  >
                                    {isEnabled ? "Aktif" : "Pasif"}
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Öğeleri sürükleyip bırakarak sıralayabilirsiniz (gruplar arası sıralama yok)
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Paketler</h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ücretsiz deneme süresi</p>
                <p className="text-2xl font-bold text-destructive">{billingData?.days_remaining || 12} gün kaldı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`relative p-5 rounded-lg border flex flex-col ${
                    plan.current
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card"
                  }`}
                >
                  {plan.current && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Seçili
                    </Badge>
                  )}
                  {plan.comingSoon && (
                    <Badge variant="secondary" className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Yakında
                    </Badge>
                  )}

                  <div className="mb-4 mt-2">
                    <h4 className={`font-semibold mb-1 ${plan.current ? "" : ""}`}>
                      {plan.name}
                    </h4>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className={`text-xs pb-0.5 ${plan.current ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${plan.current ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {plan.desc}
                    </p>
                  </div>

                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs">
                        <Check className="h-3 w-3 shrink-0" />
                        <span className={plan.current ? "text-primary-foreground/90" : ""}>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.comingSoon ? (
                    <button className="w-full py-2 rounded-md bg-muted text-muted-foreground text-xs font-medium cursor-not-allowed">
                      Yakında
                    </button>
                  ) : plan.current ? (
                    <button className="w-full py-2 rounded-md bg-primary-foreground text-primary text-xs font-medium">
                      Aktif
                    </button>
                  ) : (
                    <button className="w-full py-2 rounded-md border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                      Yükselt
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Yükleniyor...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
