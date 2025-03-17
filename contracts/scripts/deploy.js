const hre = require("hardhat")

async function main(){
    const LSYTokenFactory = await hre.ethers.getContractFactory("LSYToken")
    const lsyTokenContract = await LSYTokenFactory.deploy()    
    await lsyTokenContract.waitForDeployment()
    const token_address = await lsyTokenContract.getAddress()
    console.log("LSYToken address💵:", token_address)

    if(token_address){
        const StakingContract = await hre.ethers.getContractFactory("Staking")
        const staking = await StakingContract.deploy(token_address)
        await staking.waitForDeployment()
        const staking_address = await staking.getAddress()
        console.log("Staking address🌏:", staking_address)
    }
}

main().catch((error)=>{
    console.error("部署失败",error)
    process.exitCode = 1
})