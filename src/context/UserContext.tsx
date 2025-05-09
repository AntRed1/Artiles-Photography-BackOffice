import React, { createContext, useContext, useState, useCallback } from "react";
import type { User } from "../types/user";
import { getUsers } from "../services/userService";

interface UserContextType {
  users: User[];
  refreshUsers: () => Promise<void>;
  updateUsers: (user: User, action: "add" | "update" | "delete") => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to refresh users:", error);
    }
  }, []);

  const updateUsers = useCallback(
    (user: User, action: "add" | "update" | "delete") => {
      setUsers((prevUsers) => {
        switch (action) {
          case "add":
            return [...prevUsers, user];
          case "update":
            return prevUsers.map((u) => (u.id === user.id ? user : u));
          case "delete":
            return prevUsers.filter((u) => u.id !== user.id);
          default:
            return prevUsers;
        }
      });
    },
    []
  );

  return (
    <UserContext.Provider value={{ users, refreshUsers, updateUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
