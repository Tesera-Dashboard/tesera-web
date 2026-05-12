"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, User, Settings, CreditCard, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      if (profileRes.ok) setProfileData(await profileRes.json());
      if (settingsRes.ok) setSettingsData(await settingsRes.json());
      if (billingRes.ok) setBillingData(await billingRes.json());
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
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

  const sidebarItems = [
    { id: 1, label: "Genel Bakış", href: "/dashboard", enabled: true },
    { id: 2, label: "YZ Asistanı", href: "/dashboard/ai-assistant", enabled: true },
    { id: 3, label: "Siparişler", href: "/dashboard/orders", enabled: true },
    { id: 4, label: "Envanter", href: "/dashboard/inventory", enabled: true },
    { id: 5, label: "Kargolar", href: "/dashboard/shipments", enabled: true },
    { id: 6, label: "İş Akışları", href: "/dashboard/workflows", enabled: true },
    { id: 7, label: "Analitik", href: "/dashboard/analytics", enabled: true },
    { id: 8, label: "Bildirimler", href: "/dashboard/notifications", enabled: true },
    { id: 9, label: "Entegrasyonlar", href: "/dashboard/integrations", enabled: true },
    { id: 10, label: "Ekip", href: "/dashboard/team", enabled: true },
    { id: 11, label: "Ayarlar", href: "/dashboard/settings", enabled: true },
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

      <Tabs defaultValue="profile" className="w-full">
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
                <h4 className="text-sm font-semibold">Şirket Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organizasyon Adı</label>
                    <div className={`p-3 bg-muted rounded-lg text-sm ${!profileData?.company?.name ? "border border-dashed" : ""}`}>
                      {profileData?.company?.name || <span className="text-muted-foreground">Henüz girilmedi</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vergi Numarası</label>
                    <div className={`p-3 bg-muted rounded-lg text-sm ${!profileData?.company?.tax_number ? "border border-dashed" : ""}`}>
                      {profileData?.company?.tax_number || <span className="text-muted-foreground">Henüz girilmedi</span>}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Adres</label>
                    <div className={`p-3 bg-muted rounded-lg text-sm ${!profileData?.company?.address ? "border border-dashed" : ""}`}>
                      {profileData?.company?.address || <span className="text-muted-foreground">Henüz girilmedi</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Tehlikeli Bölge
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-3 bg-muted rounded-lg text-sm text-left hover:bg-muted/80 transition-colors">
                    <p className="font-medium">Şifre Değiştir</p>
                    <p className="text-xs text-muted-foreground mt-1">Hesap şifrenizi değiştirin</p>
                  </button>
                  <button className="p-3 bg-destructive/10 rounded-lg text-sm text-left hover:bg-destructive/20 transition-colors text-destructive">
                    <p className="font-medium">Hesabı Sil</p>
                    <p className="text-xs text-destructive/80 mt-1">Hesabınızı kalıcı olarak silin</p>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Site Ayarları</h3>
            
            <div className="space-y-6">
              {/* Theme Setting */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">Tema</p>
                  <p className="text-xs text-muted-foreground mt-1">Açık veya koyu tema seçin</p>
                </div>
                <Badge variant="secondary">{settingsData?.theme || "Açık"}</Badge>
              </div>

              {/* Sidebar Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Yan Menü Öğeleri</h4>
                <div className="space-y-2">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm">{item.label}</span>
                      <Badge variant={item.enabled ? "default" : "secondary"}>
                        {item.enabled ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Öğeleri sürükleyip bırakarak sıralayabilirsiniz (yakında)
                </p>
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
