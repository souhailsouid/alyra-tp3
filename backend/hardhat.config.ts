import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import dotenv from 'dotenv'
import '@nomicfoundation/hardhat-verify'

dotenv.config()

const config: HardhatUserConfig = {
    solidity: '0.8.24',
    networks: {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY as string}`,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY as string],
        },
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.SEPOLIA_ETHERSCAN_KEY as string,
        },
    },
}

export default config
