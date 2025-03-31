#### 安装依赖 
`npm install`

#### 创建.env文件
`HOLESKY_RPC=https://eth-holesky.g.alchemy.com/v2/这里是你的项目私钥`
`PRIVATE_KEY=这里是你的钱包地址私钥`
`ETHERSCAN_API_KEY=这里是你的Etherscan API Key`

#### 部署到测试网
`npx hardhat run scripts/deploy.js --network holesky`