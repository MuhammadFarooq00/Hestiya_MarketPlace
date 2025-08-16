// config/index.tsx
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { cookieStorage, createStorage } from "@wagmi/core";
import { fantomTestnet,sepolia,polygon } from "wagmi/chains";
export const projectId = "c393f03d1f1862474d10921e825246ca";
export const metadata = {
	name: "Hestiya",
	description: "Hestiya",
	url: "https://hestiya.com", // origin must match your domain & subdomain
	icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
/// Create wagmiConfig
// const chains = [
// {
//   ...mainnet,
//   rpcUrls: {
//     default: { http: ['https://custom-mainnet-url.com'] }, // Update to match expected type
//   },
// },
// {
//   // ...sepolia,
//   // rpcUrls: {
//   //   default: { http: ['https://custom-sepolia-url.com'] }, // Update to match expected type
//   // },
// },
// {
//   ...polygonAmoy,
// },
//  {
//   ...polygonAmoy,
//   rpcUrls: {
//     default: { http: ["https://rpc-amoy.polygon.technology"] }, // Update to match expected type
//   },
//  },
//] ;
// export const networks = [{
//   id: 1,
//   chainId: 80002,

// }]

const customPolygon = {
  ...polygon, // Spread all default polygon properties
  rpcUrls: {
	...polygon.rpcUrls, // Keep other RPC configurations
	default: { 
	  http: ["https://polygon-mainnet.g.alchemy.com/v2/vnO7TOUmsRsIv-j947I9o"] 
	},
	public: {
	  http: ["https://polygon-mainnet.g.alchemy.com/v2/vnO7TOUmsRsIv-j947I9o"]
	}
  }
};

const polyTest = {
	id: "eip155:80002",
	chainId: 80002,
	chainNamespace: "eip155",
	name: "Polygon Amoy",
	currency: "MATIC",
	explorerUrl: "https://amoy.polygonscan.com",
	rpcUrl:
		"https://polygon-amoy.g.alchemy.com/v2/38Gjw7EysPUBxh0MEZ_x8AEgHnfRVwCQ",
	imageUrl: "https://polygonscan.com",
	imageId: "https://polygonscan.com",
};
const fantomTest = {
	id: "eip155:4002",
	chainId: 4002,
	chainNamespace: "eip155",
	name: "Fantom Testnet",
	currency: "FTM",
	explorerUrl: "https://testnet.ftmscan.com",
	rpcUrl: "https://rpc.testnet.fantom.network",
	imageUrl: "https://testnet.ftmscan.com",
	imageId: "https://testnet.ftmscan.com",
};
const arbitrumSepolia = {
	id: "eip155:421614",
	chainId: 421614,
	chainNamespace: "eip155",
	name: "Arbitrum Sepolia",
	currency: "ETH",
	explorerUrl: "https://testnet.ftmscan.com",
	rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
	imageUrl: "https://testnet.ftmscan.com",
	imageId: "https://testnet.ftmscan.com",
};
//const networks=[polyTest];
const sepoliaNetwork = {
	id: "eip155:11155111", // EIP-155 namespace with Sepolia chain ID
	chainId: 11155111, // Chain ID for Sepolia
	chainNamespace: "eip155", // Ethereum-compatible namespace
	name: "Sepolia Testnet",
	currency: "ETH", // Native currency
	explorerUrl: "https://sepolia.etherscan.io", // Etherscan URL for Sepolia
	rpcUrls: {
	  default: {
		https: ["https://endpoints.omniatech.io/v1/eth/sepolia/public"], // Default RPC URL
	  },
	},
	imageUrl: "https://etherscan.io/images/brandassets/etherscan-logo-circle.png", // Optional, suitable icon URL
	imageId: "https://etherscan.io/images/brandassets/etherscan-logo-circle.png", // Optional, can be the same as imageUrl
  };
  
export const wagmiAdapter = new WagmiAdapter({
	networks: [customPolygon],
	projectId,
	metadata,
	ssr: true,
	storage: createStorage({
		storage: cookieStorage,
	}),
});

export const config = wagmiAdapter.wagmiConfig;
