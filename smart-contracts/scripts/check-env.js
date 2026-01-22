require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
    console.log("Checking environment variables...");

    // Check RPC URL
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    if (!rpcUrl) {
        console.error("❌ SEPOLIA_RPC_URL is missing!");
    } else {
        console.log("✅ SEPOLIA_RPC_URL is set.");
    }

    // Check Private Key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("❌ PRIVATE_KEY is missing!");
    } else {
        try {
            // Try to create a wallet to validate key format
            const wallet = new ethers.Wallet(privateKey);
            console.log("✅ PRIVATE_KEY is valid. Address:", wallet.address);
        } catch (error) {
            console.error("❌ PRIVATE_KEY is invalid:", error.message);
            console.log("Tip: Ensure it starts with '0x' if strictly Hex, or is a valid 64-char hex string.");
        }
    }
}

main();
