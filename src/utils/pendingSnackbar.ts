type PendingSnackbar = {
  title: string;
  description?: string;
  expiresAt: number;
};

const PENDING_SNACKBAR_TTL_MS = 5000;

let pending: PendingSnackbar | null = null;

export function setPendingSnackbar(title: string, description?: string) {
  pending = { title, description, expiresAt: Date.now() + PENDING_SNACKBAR_TTL_MS };
}

export function takePendingSnackbar(): { title: string; description?: string } | null {
  const current = pending;
  pending = null;
  if (!current || current.expiresAt <= Date.now()) {
    return null;
  }
  return { title: current.title, description: current.description };
}
