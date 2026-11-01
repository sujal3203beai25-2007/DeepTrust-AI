import { Scan, DashboardStats, ReportItem, DemoSample, ModelMetric, User } from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('deeptrust_token');
  if (token && token !== 'undefined' && token !== 'null') {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function extractErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  if (typeof err.detail === 'string') return err.detail;
  if (Array.isArray(err.detail)) {
    return err.detail.map((d: any) => (d.msg ? String(d.msg) : JSON.stringify(d))).join(', ');
  }
  if (typeof err.message === 'string') return err.message;
  return fallback;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(extractErrorMessage(err, 'Incorrect email or password.'));
    }
    return res.json();
  },

  async register(full_name: string, email: string, password: string, preferred_language = 'en'): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: full_name.trim(), email: email.trim(), password, preferred_language }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(extractErrorMessage(err, 'Registration failed.'));
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ message: string; delivery_status: string; dev_reset_url?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to process password recovery' }));
      throw new Error(extractErrorMessage(err, 'Failed to process password recovery'));
    }
    return res.json();
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Password reset failed' }));
      throw new Error(extractErrorMessage(err, 'Password reset failed'));
    }
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // Ignored
    }
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch user profile' }));
      throw new Error(extractErrorMessage(err, 'Failed to fetch user profile'));
    }
    return res.json();
  },

  async updateProfile(data: { full_name?: string; preferred_language?: string; password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(extractErrorMessage(err, 'Failed to update profile'));
    }
    return res.json();
  },

  // Scans
  async scanAudio(file: File): Promise<Scan> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/scans/audio`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Audio scan failed' }));
      throw new Error(err.detail || 'Audio scan failed');
    }
    return res.json();
  },

  async scanDualRisk(file: File): Promise<Scan> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/scans/dual-risk`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Dual-risk scan failed' }));
      throw new Error(err.detail || 'Dual-risk scan failed');
    }
    return res.json();
  },

  async scanImage(file: File): Promise<Scan> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/scans/image`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Image scan failed' }));
      throw new Error(err.detail || 'Image scan failed');
    }
    return res.json();
  },

  async scanVideo(file: File): Promise<Scan> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/scans/video`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Video scan failed' }));
      throw new Error(err.detail || 'Video scan failed');
    }
    return res.json();
  },

  async scanText(content: string, media_type: 'message' | 'url', title?: string): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content, media_type, title }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Text analysis failed' }));
      throw new Error(err.detail || 'Text analysis failed');
    }
    return res.json();
  },

  async getScans(params?: { media_type?: string; overall_risk?: string; search?: string }): Promise<Scan[]> {
    const query = new URLSearchParams();
    if (params?.media_type) query.set('media_type', params.media_type);
    if (params?.overall_risk) query.set('overall_risk', params.overall_risk);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/scans/?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch scans');
    return res.json();
  },

  async getScan(id: string): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch scan detail');
    return res.json();
  },

  async deleteScan(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/scans/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete scan');
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/scans/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error('Failed to bulk delete scans');
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Reports
  async getReports(): Promise<ReportItem[]> {
    const res = await fetch(`${API_BASE}/reports/`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  // Live Demo Lab
  async getDemoSamples(): Promise<DemoSample[]> {
    const res = await fetch(`${API_BASE}/demo/samples`);
    if (!res.ok) throw new Error('Failed to fetch demo samples');
    return res.json();
  },

  async runDemoSample(sampleId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/run/${sampleId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to execute demo sample');
    return res.json();
  },

  // Verification Assistant
  async chatAssistant(message: string, scanId?: string, language = 'en'): Promise<{ reply: string; suggested_actions: string[]; context_used?: string }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, scan_id: scanId, language }),
    });
    if (!res.ok) throw new Error('Failed to send message to assistant');
    return res.json();
  },

  // Model Transparency
  async getModelMetrics(): Promise<{ models: ModelMetric[]; transparency_statement: string }> {
    const res = await fetch(`${API_BASE}/transparency/metrics`);
    if (!res.ok) throw new Error('Failed to fetch model transparency metrics');
    return res.json();
  },
};
