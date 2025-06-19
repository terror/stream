const prefix = '/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const fetchClient = {
  get: async (endpoint: string, init?: RequestInit) => {
    return fetch(prefix + endpoint, init);
  },

  post: async (endpoint: string, data: any, init?: RequestInit) => {
    return fetch(prefix + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...init,
    });
  },

  put: async (endpoint: string, data: any, init?: RequestInit) => {
    return fetch(prefix + endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      ...init,
    });
  },

  delete: async (endpoint: string, init?: RequestInit) => {
    return fetch(prefix + endpoint, {
      method: 'DELETE',
      ...init,
    });
  },

  async deserialize<T>(
    method: Method,
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    const run = async (
      fn: (endpoint: string, init?: RequestInit) => Promise<Response>
    ): Promise<T> => (await (await fn(endpoint, init)).json()) as T;

    switch (method) {
      case 'GET':
        return run(this.get);
      case 'POST':
        return run(this.post);
      case 'PUT':
        return run(this.put);
      case 'DELETE':
        return run(this.delete);
    }
  },
};
