import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks:{
    holesky:{
      url:"https://eth-holesky.g.alchemy.com/v2/MEU2RFqGKwj0gmwfVZLgwCFqT5xXG0aK",
      accounts:process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
  etherscan:{
    apiKey:{
      holesky:process.env.ETHERSCAN_API_KEY ? process.env.ETHERSCAN_API_KEY : ""
    }
  },
  sourcify: {
    enabled: true
  }
};

export default config;
