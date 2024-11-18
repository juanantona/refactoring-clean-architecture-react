import React, { Dispatch, SetStateAction } from 'react';
import { StoreApi } from '../api/StoreApi';

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface AppContextState {
  currentUser: User;
  users: User[];
  setCurrentUser: Dispatch<SetStateAction<User>>;
  storeApi: StoreApi;
}

export const AppContext = React.createContext<AppContextState | null>(null);
