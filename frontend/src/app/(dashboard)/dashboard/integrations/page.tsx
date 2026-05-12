"use client";

import Image from "next/image";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, Plus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Integration {
  id: number;
  name: string;
  description: string;
  image?: string;
  icon?: LucideIcon;
  status: string;
}

export default function IntegrationsPage() {
  const integrations: Integration[] = [
    {
      id: 1,
      name: "Trendyol",
      description: "Trendyol pazaryeri entegrasyonu ile ürünlerinizi Trendyol'da satışa sunun",
      image: "/trendyol.png",
      status: "Yakında"
    },
    {
      id: 2,
      name: "Hepsiburada",
      description: "Hepsiburada pazaryeri entegrasyonu ile ürünlerinizi Hepsiburada'da satışa sunun",
      image: "/hepsiburada.png",
      status: "Yakında"
    },
    {
      id: 3,
      name: "Amazon",
      description: "Amazon pazaryeri entegrasyonu ile ürünlerinizi Amazon'da satışa sunun",
      image: "/amazon.png",
      status: "Yakında"
    },
    {
      id: 4,
      name: "Diğer",
      description: "Diğer pazaryeri entegrasyonları yakında eklenecek",
      icon: Plus,
      status: "Yakında"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Entegrasyonlar"
        description="Pazaryeri entegrasyonları ile ürünlerinizi birden fazla platformda yönetin"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                {integration.image ? (
                  <Image
                    src={integration.image}
                    alt={integration.name}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                ) : integration.icon ? (
                  <integration.icon className="h-16 w-16 text-muted-foreground" />
                ) : (
                  <Plug className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
              <Badge variant="secondary" className="w-fit">
                {integration.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
