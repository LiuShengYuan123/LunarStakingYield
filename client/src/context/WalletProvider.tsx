import React from "react";
import "@rainbow-me/rainbowkit/styles.css";

import { WagmiProvider } from "wagmi";
import { mainnet, holesky, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider,QueryClient} from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider,darkTheme } from "@rainbow-me/rainbowkit";


const config = getDefaultConfig({
  ssr: true, // If your dApp uses server side rendering (SSR)
  appName: "staking-dapp",
  projectId: "bc52494a7f2569b5aa261e9fa00a6347",
  chains: [holesky, polygon, optimism, arbitrum, base],
});

const queryClient = new QueryClient();
const customTheme = darkTheme({
  accentColor: `linear-gradient(150deg,#0a182f 0%,#2d1a45cc 45%,#fade8e 100%)`,
  accentColorForeground: 'white',
  borderRadius: 'large',
})
export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider coolMode theme={customTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
