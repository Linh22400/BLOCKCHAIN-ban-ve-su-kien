const { ethers } = require("hardhat");

async function main() {
    // Lấy account có 10000 ETH từ Hardhat
    const [signer] = await ethers.getSigners();

    console.log("Sending ETH from:", await signer.getAddress());
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");

    // Địa chỉ MetaMask của bạn - THAY ĐỊA CHỈ NÀY
    const recipientAddress = "0xe56654afdf528b0fc80005f7a47bf7577ec2b0ca";

    // Send 100 ETH
    const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther("100")
    });

    console.log("\nSending 100 ETH...");
    console.log("Transaction hash:", tx.hash);

    await tx.wait();

    console.log("✅ Success! Sent 100 ETH to", recipientAddress);
    console.log("Check your MetaMask balance!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
