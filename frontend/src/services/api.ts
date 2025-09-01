const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

export class ApiError extends Error {
  public status: number;
  public response?: any;
  
  constructor(
    message: string,
    status: number,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData;
        
        try {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {

        }
        
        throw new ApiError(errorMessage, response.status, errorData);
      }


      if (response.status === 204) {
        return undefined as unknown as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      

      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {});
      const searchParams = new URLSearchParams(filteredParams);
      url += `?${searchParams.toString()}`;
    }
    
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  async post<T>(
    endpoint: string, 
    data: any, 
    options: { etag?: string } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (options.etag) {
      headers['If-None-Match'] = options.etag;
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
  }

  async patch<T>(
    endpoint: string, 
    data: any, 
    options: { etag?: string } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {};
    
    if (options.etag) {
      headers['If-Match'] = options.etag;
    }

    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers,
    });
  }

  async delete(endpoint: string): Promise<void> {
    return this.makeRequest<void>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };