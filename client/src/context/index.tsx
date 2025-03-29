"use client";

import React from "react";
import { WalletProvider } from "./WalletProvider";
import { AccountProvider } from "./AccountContext";
import { AntDesignConfigProvider } from "./AntDesignConfigProvider";


export const MainContext = React.createContext("Main");
export const MainProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      <MainContext.Provider value={"Main"}>
        <AccountProvider>
          <AntDesignConfigProvider>
            {children}
          </AntDesignConfigProvider>
        </AccountProvider>
      </MainContext.Provider>
    </WalletProvider>
  );
};
