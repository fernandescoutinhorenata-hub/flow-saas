import React, { useState, useContext } from 'react';
import { USERS, PERMISSIONS } from '../data.js';

export const AuthContext = React.createContext();

export function AuthProvider({ children, forcedUser }) {
  const [currentUser, setCurrentUser] = useState(forcedUser || USERS[4]); // Default Admin (Você)

  const hasPermission = (action) => {
    const userPermissions = PERMISSIONS[currentUser.role] || [];
    return userPermissions.includes(action);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
