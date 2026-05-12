"use client";

import Image from "next/image";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Workflow, Shield, Settings } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Ekip"
        description="Ekibinizi yönetin, roller atayın ve iş akışlarını kişilere özel olarak tanımlayın"
      />

      <Card className="p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative h-64 w-64">
            <Image
              src="/ekip.png"
              alt="Ekip Yönetimi"
              fill
              className="object-contain"
            />
          </div>
          
          <div className="space-y-4 max-w-md">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              Yakında
            </Badge>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Ekip Yönetimi Yakında Geliyor</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ekibinizi oluşturun, roller tanımlayın ve iş akışlarını kişilere özel olarak atayın.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-3 text-left p-3 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Ekip Üyeleri</p>
                  <p className="text-xs text-muted-foreground">Ekibinizi oluşturun ve yönetin</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left p-3 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Workflow className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Kişisel İş Akışları</p>
                  <p className="text-xs text-muted-foreground">Kişilere özel iş akışları atayın</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left p-3 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Rol Yönetimi</p>
                  <p className="text-xs text-muted-foreground">Kullanıcı rollerini tanımlayın</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-left p-3 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">İzinler</p>
                  <p className="text-xs text-muted-foreground">Kullanıcı izinlerini yönetin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
