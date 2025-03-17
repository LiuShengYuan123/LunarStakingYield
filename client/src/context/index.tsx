"use client";

import React from "react";
import { WalletProvider } from "./WalletProvider";
import { AccountProvider } from "./AccountContext";

export const MainContext = React.createContext("Main");
export const MainProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      <MainContext.Provider value={"Main"}>
        <AccountProvider>{children}</AccountProvider>
      </MainContext.Provider>
    </WalletProvider>
  );
};
