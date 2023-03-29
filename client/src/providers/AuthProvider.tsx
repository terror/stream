import { PropsWithChildren, createContext, useEffect, useState } from 'react';

import { User } from '../model/User';
import { fetchClient } from '../lib/fetchClient';

export const AuthContext = createContext<User | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient
      .getDataParsed<User>('/user', { credentials: 'include' })
      .then((data) => setUser(data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
