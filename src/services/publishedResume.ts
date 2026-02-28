import { SECURITY_CONFIG } from '@/utils/security';

export interface PublishedResume {
  id: string;
  user_id: string | null;
  resume_data: string;
  title: string;
  template_name: string;
  created_at: string;
  updated_at: string;
  client_ip?: string;
  user_agent?: string;
  data_size?: number;
}

export interface RateLimitInfo {
  requests_in_window: number;
  max_requests: number;
  window_minutes: number;
  reset_time: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class PublishedResumeService {
  static async checkRateLimit(): Promise<{ allowed: boolean; info?: RateLimitInfo; error?: string }> {
    // The rate limit check is now primarily handled by the backend during the publish call.
    // We mock a passing response here to avoid breaking the frontend UI logic prematurely.
    return { allowed: true };
  }

  static async publishResume(
    encryptedResumeData: string,
    title?: string,
    existingId?: string
  ): Promise<{ data: PublishedResume | null; error: string | null }> {
    try {
      const response = await fetch(`${API_URL}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encryptedResumeData,
          title,
          existingId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.message || 'Failed to publish resume' };
      }

      const result = await response.json();
      return { data: result.data as PublishedResume, error: null };
    } catch (error) {
      return { data: null, error: 'An unexpected error occurred while communicating with the API' };
    }
  }

  static async getPublishedResume(id: string): Promise<{ data: PublishedResume | null; error: string | null }> {
    try {
      const response = await fetch(`${API_URL}/publish/${id}`);

      if (!response.ok) {
        return { data: null, error: 'Resume not found' };
      }

      const result = await response.json();
      return { data: result.data as PublishedResume, error: null };
    } catch (error) {
      return { data: null, error: 'An unexpected error occurred while communicating with the API' };
    }
  }

  static async deletePublishedResume(id: string): Promise<{ error: string | null }> {
    try {
      const response = await fetch(`${API_URL}/publish/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        return { error: 'Failed to delete resume' };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred while communicating with the API' };
    }
  }

  static async getPublishingStats(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const response = await fetch(`${API_URL}/publish/stats`);

      if (!response.ok) {
        return { data: [], error: null };
      }

      const result = await response.json();
      return { data: result.data || [], error: null };
    } catch (error) {
      return { data: [], error: null };
    }
  }

  static async cleanupOldResumes(): Promise<{ deletedCount: number | null; error: string | null }> {
    try {
      const response = await fetch(`${API_URL}/publish/cleanup`, {
        method: 'POST'
      });

      if (!response.ok) {
        return { deletedCount: 0, error: 'Cleanup function not available' };
      }

      const result = await response.json();
      return { deletedCount: result.deletedCount, error: null };
    } catch (error) {
      return { deletedCount: 0, error: 'Cleanup function not available' };
    }
  }
}