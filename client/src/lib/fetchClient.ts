export const fetchClient = {
  async get(endpoint: string, init?: RequestInit) {
    return fetch(endpoint, init);
  },
  async getData<T>(endpoint: string, init?: RequestInit) {
    return (await (await this.get(endpoint, init)).json()) as T;
  },
  async getDataParsed<T>(endpoint: string, init?: RequestInit) {
    return JSON.parse(await (await this.get(endpoint, init)).json()) as T;
  },
  post: async (endpoint: string, data: any, init?: RequestInit) => {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...init,
    });
  },
  put: async (endpoint: string, data: any, init?: RequestInit) => {
    return fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...init,
    });
  },
  delete: async (endpoint: string, init?: RequestInit) => {
    return fetch(endpoint, {
      method: 'DELETE',
      ...init,
    });
  },
};
