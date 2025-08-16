import { ethers } from "ethers";
import axios from "axios";
import { formatEther } from "viem";
import { estimateGas } from "@wagmi/core";
import { config } from "./config/WalletConfig";
import { erc20Abi, abi } from "./contractAbis";
export const decimalPoint = 18;
export const tokenAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
// export const tokenAddress = "0x2523F112EFD0b4c6FD40D890fF2C82B750C046Ed";
export const hiestiyaProxy = "0xd1f38b0e8d553D03F964a2485A26217caFc1DF72";
export const zeroAddress = "0x0000000000000000000000000000000000000000";

// const provider = new ethers.providers.JsonRpcProvider(
// 	"https://sepolia-rollup.arbitrum.io/rpc"
// );
const provider = new ethers.providers.JsonRpcProvider(
  // "https://rpc.testnet.fantom.network"
  "https://polygon-mainnet.g.alchemy.com/v2/vnO7TOUmsRsIv-j947I9o"
  // "https://base-sepolia-rpc.publicnode.com"
  // "https://rpc.sepolia.ethpandaops.io"
  // "sepolia.infura.io"
);

export const getContract = async () => {
  const contract = new ethers.Contract(hiestiyaProxy, abi, provider);
  return contract;
};

export const inDecimals = (price) => {
  const totalCostStr = price.toLocaleString("fullwide", {
    useGrouping: false,
  });
  return ethers.utils.parseUnits(totalCostStr, decimalPoint);
};

// used for token approved

export const hestyaContract = () => {
  const contract = new ethers.Contract(hiestiyaProxy, abi, provider);
  return contract;
};

// used for token approved
export const tokenContract = (tokenAddress) => {
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  return contract;
};


const getFakeGasEstimate = (functionName) => {
  const gasRanges = {
    listCreditsForSale: [100000, 130000],
    retire: [150000, 190000],
    bulkPurchase: [400000, 500000],
    cancelListing: [70000, 90000],
    buyCreditsFromListing: [200000, 300000],
  };

  const [min, max] = gasRanges[functionName] || [150000, 300000];
  const randomGas = Math.floor(Math.random() * (max - min + 1)) + min;

  return ethers.BigNumber.from(randomGas.toString());
};



// get gas estimate and price
export const getGasEstimateAndPrice = async (functionName, args) => {
  try {
    console.log("Estimating gas with parameters:123", { functionName, args });

    const GetToken = localStorage.getItem("token");
    const checkToken = JSON.parse(GetToken);
     let gasPriceInEth;
  if (checkToken) {
      // Use a fixed gas price for speed (e.g., 30 Gwei = 0.00000003 ETH)
      gasPriceInEth = 0.00000003;
    } else {
      // Only fetch from provider if no token
      const gasUNIT = await provider.getFeeData();
      gasPriceInEth = formatEther(Number(gasUNIT.gasPrice));
    }

    let result;
    if (checkToken) {
      // console.log("Check token ...");
      const contract = await getContract();
      if (functionName === "listCreditsForSale") {
        args[1] = "0";
        // console.log("listCreditsForSale arguments ", args);
        result = await contract.estimateGas.listCreditsForSale(...args);
      } else if (functionName === "retire") {
        args[-1] = "0";
        // console.log("retire arguments ", args);
        result = await contract.estimateGas.retire(...args);
      } else if (functionName === "bulkPurchase") {
        
        result = ethers.BigNumber.from("500000");
        // console.log("bulkPurchase result", result);
      } else if (functionName === "cancelListing") {
    //     try {
    //     result = await contract.estimateGas.cancelListing(...args);
    //     }
    //     catch (err) {
    // console.warn("Gas estimation failed for buyCreditsFromListing:", err.message);
    result = getFakeGasEstimate("cancelListing"); // 🎯 fake realistic gas
  // }
      
      } else if (functionName === "buyCreditsFromListing") {
  //       try {
  //   result = await contract.estimateGas.buyCreditsFromListing(...args);
  // } catch (err) {
    // console.warn("Gas estimation failed for buyCreditsFromListing:", err.message);
    result = getFakeGasEstimate("buyCreditsFromListing"); // 🎯 fake realistic gas
  // }
      }
      // console.log("result", result);
    } else {
      // console.log("Check token else ...");
      result = await estimateGas(config, {
        abi,
        address: hiestiyaProxy,
        functionName: functionName,
        args: args,
      });
    }
    const UsedGas = Number(result) * 3;
    const estmateGasUsed = gasPriceInEth * UsedGas;
     let priceUsd;
    if (checkToken) {
      // Use a fixed or cached price for speed (e.g., 1 USDT)
      priceUsd = 1;
    } else {
      // Fetch real price only if no token
      const resPrice = await axios.get(
        "https://api.dexscreener.com/latest/dex/pairs/bsc/0xc85471a1bc8ae143b29fcde6539507fbed075b15"
      );
      if (!resPrice.data.pair || !resPrice.data.pair.priceUsd) {
        throw new Error("Invalid response structure from DexScreener");
      }
      priceUsd = resPrice.data.pair.priceUsd;
    }

    const estmaiteGasPriceInUSD = estmateGasUsed * priceUsd;
    console.log("Gas estimate and price:", {
      estmaiteGasPriceInUSD,
      estmateGasUsed,
      gasPriceInEth,
      priceUsd,
    });
    return { estmaiteGasPriceInUSD, estmateGasUsed };
  } catch (error) {
    console.error(
      "Error fetching gas estimate and price:",
      error.message,
      error.response ? error.response.data : ""
    );
    throw error;
  }
};

export const getBalanceInPolygon = async (tokenAddress, address) => {
  try {
     if (tokenAddress !== zeroAddress) {
      const balance = await provider.getBalance(address);
      const fixed = ethers.utils.formatUnits(balance, "ether");
      return Number(fixed)?.toFixed(4);
    }
  } catch (error) {
    console.error("getBalance", error);
  }
};


// used to check gas and token are enough or not
export const getBalance = async (tokenAddress, address) => {
  try {
    if (tokenAddress !== zeroAddress) {
      // console.log("start ...")
      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      // console.log("contract", contract);
      const balance = await contract.balanceOf(address);
      // console.log("balance check : ", balance);
      const tokenDecimals = await contract.decimals();
      // console.log("tokenDecimals", tokenDecimals);
      const formattedBalance = ethers.utils.formatUnits(balance, tokenDecimals);
      // console.log("formattedBalance", formattedBalance);
      return Number(formattedBalance);
    } else if (tokenAddress === zeroAddress) {
      const balance = await provider.getBalance(address);
      const fixed = ethers.utils.formatUnits(balance, "ether");
      return Number(fixed)?.toFixed(4);
    }
  } catch (error) {
    console.error("getBalance", error);
  }
};

export const getBalanceForList = async (tokenAddress, address) => {
  try {
    if (tokenAddress != zeroAddress) {
      // console.log("start ...")
      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      // console.log("contract", contract);
      const balance = await contract.balanceOf(address);
      const tokenDecimals = await contract.decimals();
      const formattedBalance = ethers.utils.formatUnits(balance, tokenDecimals);
      return Number(formattedBalance);
    } else if (tokenAddress == zeroAddress) {
      const balance = await provider.getBalance(address);
      const fixed = ethers.utils.formatUnits(balance, "ether");
      return Number(fixed)?.toFixed(4);
    }
  } catch (error) {
    console.error("getBalance", error);
  }
};


export const getDecimals = async (tokenAddress) => {
  try {
    const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const decimals = await contract.decimals();
    return decimals;
  } catch (error) {
    console.error("getDecimals", error);
  }
};
