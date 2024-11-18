import { useState } from 'react';
import { AppContext, User } from './AppContext';
import { StoreApi } from '../api/StoreApi';

const adminUser: User = { id: 'user1', name: 'Admin user', isAdmin: true };

const users: User[] = [adminUser, { id: 'user2', name: 'Non admin user', isAdmin: false }];

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(adminUser);

  const storeApi = new StoreApi();

  return (
    <AppContext.Provider value={{ users, currentUser, setCurrentUser, storeApi }}>
      {children}
    </AppContext.Provider>
  );
};
