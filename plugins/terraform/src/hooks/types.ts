export interface Run {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  confirmedBy?: {
    name: string;
    avatar?: string;
  };
  plan?: {
    logs?: string | null;
  };
}
