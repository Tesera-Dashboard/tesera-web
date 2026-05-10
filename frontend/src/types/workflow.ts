export interface WorkflowStep {
  id: string;
  workflow_id: string;
  order: number;
  step_type: string;
  step_config: Record<string, any> | null;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Workflow {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: WorkflowStep[];
}

export interface WorkflowCreate {
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: Record<string, any>;
  steps: Record<string, any>[];
}

export interface WorkflowUpdate {
  name?: string;
  description?: string;
  trigger_type?: string;
  trigger_config?: Record<string, any>;
  is_active?: boolean;
  steps?: Record<string, any>[];
}
