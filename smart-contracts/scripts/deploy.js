const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying EventFactory contract...");

    // Deploy EventFactory
    const EventFactory = await ethers.getContractFactory("EventFactory");
    const eventFactory = await EventFactory.deploy();
    await eventFactory.waitForDeployment();

    const factoryAddress = await eventFactory.getAddress();
    console.log(`EventFactory deployed to: ${factoryAddress}`);

    // Create a sample event
    console.log("\nCreating sample event...");

    const EVENT_NAME = "Blockchain Concert 2024";
    const SYMBOL = "BC2024";
    const EVENT_DATE = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    const EVENT_LOCATION = "Cyber Arena";
    const TICKET_PRICE = ethers.parseEther("0.1");
    const MAX_RESALE_PRICE = ethers.parseEther("0.12"); // 20% above original
    const ROYALTY_PERCENTAGE = 500; // 5%
    const TOTAL_TICKETS = 100;

    const tx = await eventFactory.createEvent(
        EVENT_NAME,
        SYMBOL,
        EVENT_NAME,
        EVENT_DATE,
        EVENT_LOCATION,
        TICKET_PRICE,
        MAX_RESALE_PRICE,
        ROYALTY_PERCENTAGE,
        TOTAL_TICKETS
    );

    const receipt = await tx.wait();
    console.log("Event created!");

    // Get event address from logs
    const eventCreatedLog = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "EventCreated"
    );

    if (eventCreatedLog) {
        const eventAddress = eventCreatedLog.args[0];
        console.log(`Sample Event (EventTicket) deployed to: ${eventAddress}`);
    }

    console.log("\n=== Deployment Summary ===");
    console.log(`EventFactory: ${factoryAddress}`);
    console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
    console.log("==========================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
