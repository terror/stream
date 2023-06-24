import { PropsWithChildren, createContext, useEffect, useState } from 'react';

import { fetchClient } from '../lib/fetchClient';
import { User } from '../model/User';

export const AuthContext = createContext<User | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient
      .deserialize<User>('GET', '/user', { credentials: 'include' })
      .then((data) => setUser(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
