import { wagmiAdapter, config, projectId, metadata } from "./WalletConfig";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { fantomTestnet,sepolia,polygon } from "wagmi/chains";


// const polyTest = {
// 	id: "eip155:",
// 	chainId: 80002,
// 	chainNamespace: "eip155",
// 	name: "Polygon Amoy",
// 	currency: "MATIC",
// 	explorerUrl: "https://amoy.polygonscan.com",
// 	rpcUrl:
// 		"https://polygon-amoy.g.alchemy.com/v2/38Gjw7EysPUBxh0MEZ_x8AEgHnfRVwCQ",
// 	imageUrl: "https://polygonscan.com",
// 	imageId: "https://polygonscan.com",
// };

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

// console.log("check the polygon", polygon)

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

const queryClient = new QueryClient();
createAppKit({
	metadata,
	wagmiConfig: config,
	projectId,
	adapters: [wagmiAdapter],
	enableAnalytics: true,
	networks: [customPolygon],
	
	features: {
		email: true, // default to true
		socials: [
			"google",
			"x",
			"github",
			"discord",
			"apple",
			"facebook",
			"farcaster",
		],
		emailShowWallets: true, // default to true
	},
	allWallets: "SHOW", // default to SHOW
	featuredWalletIds: [
		"c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
	],
	features: {
		onramp: true,
	},
	allWallets: "SHOW",
});
export default function AppKitProvider({ children }) {
	return (
		<WagmiProvider config={wagmiAdapter.wagmiConfig}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}
