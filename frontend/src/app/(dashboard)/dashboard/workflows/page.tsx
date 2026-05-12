"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Play, Trash2, Edit2, MoreVertical, ChevronRight, Zap, Clock, Webhook } from "lucide-react";
import { toast } from "sonner";
import { Workflow, WorkflowStep } from "@/types/workflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState("manual");
  const [createSteps, setCreateSteps] = useState<Record<string, any>[]>([]);
  const [createStepName, setCreateStepName] = useState("");
  const [createStepType, setCreateStepType] = useState("");
  const [createStepDescription, setCreateStepDescription] = useState("");
  const [editWorkflowName, setEditWorkflowName] = useState("");
  const [editWorkflowDescription, setEditWorkflowDescription] = useState("");
  const [editWorkflowTrigger, setEditWorkflowTrigger] = useState("");
  const [editSteps, setEditSteps] = useState<Record<string, any>[]>([]);
  const [newStepName, setNewStepName] = useState("");
  const [newStepType, setNewStepType] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");

  const loadWorkflows = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/workflows");
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Workflow API error:", errorData);
        throw new Error(errorData.detail || "Workflow yüklenirken hata oluştu");
      }
      const data = await res.json();
      console.log("Workflows loaded:", data);
      setWorkflows(data);
    } catch (err) {
      console.error("Workflow yüklenirken hata:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast.error("İş akışı adı gereklidir");
      return;
    }

    try {
      const res = await fetchWithAuth("/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: newWorkflowName,
          description: newWorkflowDescription,
          trigger_type: newWorkflowTrigger,
          steps: createSteps.map((s, i) => ({
            ...s,
            order: i
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "İş akışı oluşturulamadı");
      }

      toast.success("İş akışı başarıyla oluşturuldu");
      setNewWorkflowName("");
      setNewWorkflowDescription("");
      setNewWorkflowTrigger("manual");
      setCreateSteps([]);
      setCreateStepName("");
      setCreateStepType("");
      setCreateStepDescription("");
      setIsCreateDialogOpen(false);
      loadWorkflows();
    } catch (err: any) {
      console.error("Workflow creation error:", err);
      toast.error(`İş akışı oluşturulamadı: ${err.message}`);
    }
  };

  const handleAddCreateStep = () => {
    if (!createStepName.trim()) {
      toast.error("Adım adı gereklidir");
      return;
    }
    if (!createStepType) {
      toast.error("Adım türü gereklidir");
      return;
    }

    const newStep = {
      order: createSteps.length,
      step_type: createStepType,
      step_config: {},
      name: createStepName,
      description: createStepDescription
    };

    setCreateSteps([...createSteps, newStep]);
    setCreateStepName("");
    setCreateStepType("");
    setCreateStepDescription("");
  };

  const handleRemoveCreateStep = (index: number) => {
    const updatedSteps = createSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setCreateSteps(updatedSteps);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm("Bu iş akışını silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetchWithAuth(`/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "İş akışı silinemedi");
      }

      toast.success("İş akışı başarıyla silindi");
      loadWorkflows();
    } catch (err: any) {
      console.error("Workflow delete error:", err);
      toast.error(`İş akışı silinemedi: ${err.message}`);
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      const res = await fetchWithAuth(`/workflows/${workflow.id}`, {
        method: "PUT",
        body: JSON.stringify({
          is_active: !workflow.is_active,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "İş akışı güncellenemedi");
      }

      toast.success(workflow.is_active ? "İş akışı devre dışı bırakıldı" : "İş akışı aktif edildi");
      loadWorkflows();
    } catch (err: any) {
      console.error("Workflow toggle error:", err);
      toast.error(`İş akışı güncellenemedi: ${err.message}`);
    }
  };

  const handleEditWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const res = await fetchWithAuth(`/workflows/${selectedWorkflow.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editWorkflowName,
          description: editWorkflowDescription,
          trigger_type: editWorkflowTrigger,
          steps: editSteps.map((s, i) => ({
            ...s,
            order: i
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "İş akışı güncellenemedi");
      }

      toast.success("İş akışı başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedWorkflow(null);
      setEditSteps([]);
      loadWorkflows();
    } catch (err: any) {
      console.error("Workflow update error:", err);
      toast.error(`İş akışı güncellenemedi: ${err.message}`);
    }
  };

  const handleAddStep = () => {
    if (!newStepName.trim()) {
      toast.error("Adım adı gereklidir");
      return;
    }
    if (!newStepType) {
      toast.error("Adım türü gereklidir");
      return;
    }

    const newStep = {
      order: editSteps.length,
      step_type: newStepType,
      step_config: {},
      name: newStepName,
      description: newStepDescription
    };

    setEditSteps([...editSteps, newStep]);
    setNewStepName("");
    setNewStepType("");
    setNewStepDescription("");
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = editSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    setEditSteps(updatedSteps);
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "manual":
        return <Zap className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "webhook":
        return <Webhook className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case "manual":
        return "Manuel";
      case "scheduled":
        return "Zamanlanmış";
      case "webhook":
        return "Webhook";
      case "event":
        return "Olay Tabanlı";
      default:
        return triggerType;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="İş Akışları"
          description={`${workflows.length} iş akışı listeleniyor`}
        />
        <Button onClick={() => setIsCreateDialogOpen(true)} className="h-10">
          <Plus className="mr-2 h-4 w-4" />
          Yeni İş Akışı
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz iş akışı yok</h3>
          <p className="text-muted-foreground text-sm mb-6">
            İş süreçlerinizi otomatikleştirmek için ilk iş akışınızı oluşturun.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            İlk İş Akışını Oluştur
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    {getTriggerIcon(workflow.trigger_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getTriggerLabel(workflow.trigger_type)}
                    </p>
                  </div>
                </div>
                <Badge variant={workflow.is_active ? "default" : "secondary"}>
                  {workflow.is_active ? "Aktif" : "Pasif"}
                </Badge>
              </div>

              {workflow.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {workflow.description}
                </p>
              )}

              <Separator className="my-4" />

              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Adımlar ({workflow.steps.length})</p>
                {workflow.steps.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Henüz adım eklenmedi</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {workflow.steps.slice(0, 3).map((step) => (
                      <Badge key={step.id} variant="outline" className="text-xs">
                        {step.name}
                      </Badge>
                    ))}
                    {workflow.steps.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{workflow.steps.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleToggleActive(workflow)}
                >
                  {workflow.is_active ? "Durdur" : "Başlat"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setEditWorkflowName(workflow.name);
                    setEditWorkflowDescription(workflow.description || "");
                    setEditWorkflowTrigger(workflow.trigger_type);
                    setEditSteps(workflow.steps.map(s => ({
                      id: s.id,
                      order: s.order,
                      step_type: s.step_type,
                      step_config: s.step_config,
                      name: s.name,
                      description: s.description
                    })));
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni İş Akışı Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">İş Akışı Adı *</Label>
              <Input
                id="name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="Örn: Stok Uyarısı Bildirimi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                placeholder="İş akışı hakkında kısa açıklama..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trigger">Tetikleyici Türü</Label>
              <select
                id="trigger"
                value={newWorkflowTrigger}
                onChange={(e) => setNewWorkflowTrigger(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="manual">Manuel</option>
                <option value="scheduled">Zamanlanmış</option>
                <option value="webhook">Webhook</option>
                <option value="event">Olay Tabanlı</option>
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Adımlar ({createSteps.length})</Label>
              {createSteps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz adım eklenmedi</p>
              ) : (
                <div className="space-y-2">
                  {createSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-muted-foreground">{step.step_type}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCreateStep(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <Label>Yeni Adım Ekle</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-step-name" className="text-xs">Adım Adı</Label>
                  <Input
                    id="create-step-name"
                    value={createStepName}
                    onChange={(e) => setCreateStepName(e.target.value)}
                    placeholder="Örn: Bildirim Gönder"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-step-type" className="text-xs">Adım Türü</Label>
                  <select
                    id="create-step-type"
                    value={createStepType}
                    onChange={(e) => setCreateStepType(e.target.value)}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Seçin...</option>
                    <option value="send_notification">Bildirim Gönder</option>
                    <option value="update_inventory">Envanter Güncelle</option>
                    <option value="create_order">Sipariş Oluştur</option>
                    <option value="ai_action">YZ Aksiyonu</option>
                    <option value="delay">Gecikme</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-step-description" className="text-xs">Açıklama</Label>
                <Input
                  id="create-step-description"
                  value={createStepDescription}
                  onChange={(e) => setCreateStepDescription(e.target.value)}
                  placeholder="Adım açıklaması..."
                  className="text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddCreateStep}
                disabled={!createStepName || !createStepType}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adım Ekle
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateWorkflow}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>İş Akışını Düzenle</DialogTitle>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">İş Akışı Adı</Label>
                <Input
                  id="edit-name"
                  value={editWorkflowName}
                  onChange={(e) => setEditWorkflowName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Açıklama</Label>
                <Textarea
                  id="edit-description"
                  value={editWorkflowDescription}
                  onChange={(e) => setEditWorkflowDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-trigger">Tetikleyici Türü</Label>
                <select
                  id="edit-trigger"
                  value={editWorkflowTrigger}
                  onChange={(e) => setEditWorkflowTrigger(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="manual">Manuel</option>
                  <option value="scheduled">Zamanlanmış</option>
                  <option value="webhook">Webhook</option>
                  <option value="event">Olay Tabanlı</option>
                </select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Adımlar ({editSteps.length})</Label>
                {editSteps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Henüz adım eklenmedi</p>
                ) : (
                  <div className="space-y-2">
                    {editSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.name}</p>
                          <p className="text-xs text-muted-foreground">{step.step_type}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveStep(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Label>Yeni Adım Ekle</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="step-name" className="text-xs">Adım Adı</Label>
                    <Input
                      id="step-name"
                      value={newStepName}
                      onChange={(e) => setNewStepName(e.target.value)}
                      placeholder="Örn: Bildirim Gönder"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="step-type" className="text-xs">Adım Türü</Label>
                    <select
                      id="step-type"
                      value={newStepType}
                      onChange={(e) => setNewStepType(e.target.value)}
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Seçin...</option>
                      <option value="send_notification">Bildirim Gönder</option>
                      <option value="update_inventory">Envanter Güncelle</option>
                      <option value="create_order">Sipariş Oluştur</option>
                      <option value="ai_action">YZ Aksiyonu</option>
                      <option value="delay">Gecikme</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step-description" className="text-xs">Açıklama</Label>
                  <Input
                    id="step-description"
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                    placeholder="Adım açıklaması..."
                    className="text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddStep}
                  disabled={!newStepName || !newStepType}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adım Ekle
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditWorkflow}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
