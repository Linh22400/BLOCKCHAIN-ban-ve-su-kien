import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT Ticketing System", function () {
    let eventFactory;
    let eventTicket;
    let organizer;
    let buyer1;
    let buyer2;

    const EVENT_NAME = "Blockchain Concert 2024";
    const SYMBOL = "BC2024";
    const EVENT_DATE = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    const EVENT_LOCATION = "Cyber Arena";
    const TICKET_PRICE = ethers.parseEther("0.1");
    const MAX_RESALE_PRICE = ethers.parseEther("0.12"); // 20% above original
    const ROYALTY_PERCENTAGE = 500; // 5%
    const TOTAL_TICKETS = 100;

    beforeEach(async function () {
        [organizer, buyer1, buyer2] = await ethers.getSigners();

        // Deploy EventFactory
        const EventFactoryContract = await ethers.getContractFactory("EventFactory");
        eventFactory = await EventFactoryContract.deploy();
        await eventFactory.waitForDeployment();

        // Create an event
        const tx = await eventFactory.connect(organizer).createEvent(
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
        const eventCreatedLog = receipt.logs.find(
            (log) => log.fragment && log.fragment.name === "EventCreated"
        );

        const eventAddress = eventCreatedLog.args[0];
        eventTicket = await ethers.getContractAt("EventTicket", eventAddress);
    });

    describe("Event Creation", function () {
        it("Should create event via factory", async function () {
            const allEvents = await eventFactory.getAllEvents();
            expect(allEvents.length).to.equal(1);
        });

        it("Should set correct event details", async function () {
            expect(await eventTicket.eventName()).to.equal(EVENT_NAME);
            expect(await eventTicket.ticketPrice()).to.equal(TICKET_PRICE);
            expect(await eventTicket.totalTickets()).to.equal(TOTAL_TICKETS);
        });

        it("Should transfer ownership to organizer", async function () {
            expect(await eventTicket.owner()).to.equal(organizer.address);
        });
    });

    describe("Ticket Minting", function () {
        it("Should mint ticket with correct payment", async function () {
            await eventTicket.connect(buyer1).mintTicket(
                buyer1.address,
                "ipfs://ticket1",
                { value: TICKET_PRICE }
            );

            expect(await eventTicket.ownerOf(0)).to.equal(buyer1.address);
            expect(await eventTicket.totalMinted()).to.equal(1);
        });

        it("Should reject minting with insufficient payment", async function () {
            await expect(
                eventTicket.connect(buyer1).mintTicket(
                    buyer1.address,
                    "ipfs://ticket1",
                    { value: ethers.parseEther("0.05") }
                )
            ).to.be.revertedWith("Insufficient payment");
        });

        it("Should reject minting when sold out", async function () {
            // Mint all tickets
            for (let i = 0; i < TOTAL_TICKETS; i++) {
                await eventTicket.connect(buyer1).mintTicket(
                    buyer1.address,
                    `ipfs://ticket${i}`,
                    { value: TICKET_PRICE }
                );
            }

            // Try to mint one more
            await expect(
                eventTicket.connect(buyer1).mintTicket(
                    buyer1.address,
                    "ipfs://extra",
                    { value: TICKET_PRICE }
                )
            ).to.be.revertedWith("All tickets sold");
        });
    });

    describe("Ticket Resale", function () {
        beforeEach(async function () {
            // Buyer1 mints a ticket
            await eventTicket.connect(buyer1).mintTicket(
                buyer1.address,
                "ipfs://ticket1",
                { value: TICKET_PRICE }
            );
        });

        it("Should allow resale at valid price with royalty", async function () {
            const resalePrice = ethers.parseEther("0.11");
            const royalty = (resalePrice * BigInt(ROYALTY_PERCENTAGE)) / BigInt(10000);

            const organizerBalanceBefore = await ethers.provider.getBalance(organizer.address);

            await eventTicket.connect(buyer1).resellTicket(0, buyer2.address, {
                value: resalePrice
            });

            expect(await eventTicket.ownerOf(0)).to.equal(buyer2.address);

            const organizerBalanceAfter = await ethers.provider.getBalance(organizer.address);
            expect(organizerBalanceAfter - organizerBalanceBefore).to.equal(royalty);
        });

        it("Should reject resale above price ceiling", async function () {
            const excessivePrice = ethers.parseEther("0.15");

            await expect(
                eventTicket.connect(buyer1).resellTicket(0, buyer2.address, {
                    value: excessivePrice
                })
            ).to.be.revertedWith("Price exceeds ceiling");
        });

        it("Should reject resale by non-owner", async function () {
            await expect(
                eventTicket.connect(buyer2).resellTicket(0, buyer2.address, {
                    value: TICKET_PRICE
                })
            ).to.be.revertedWith("Not ticket owner");
        });
    });

    describe("Ticket Check-in", function () {
        beforeEach(async function () {
            await eventTicket.connect(buyer1).mintTicket(
                buyer1.address,
                "ipfs://ticket1",
                { value: TICKET_PRICE }
            );
        });

        it("Should mark ticket as used by organizer", async function () {
            await eventTicket.connect(organizer).markTicketUsed(0);
            expect(await eventTicket.ticketUsed(0)).to.equal(true);
        });

        it("Should validate ticket before use", async function () {
            expect(await eventTicket.isTicketValid(0, buyer1.address)).to.equal(true);

            await eventTicket.connect(organizer).markTicketUsed(0);

            expect(await eventTicket.isTicketValid(0, buyer1.address)).to.equal(false);
        });

        it("Should reject non-organizer from marking used", async function () {
            await expect(
                eventTicket.connect(buyer1).markTicketUsed(0)
            ).to.be.revertedWithCustomError(eventTicket, "OwnableUnauthorizedAccount");
        });

        it("Should prevent resale of used ticket", async function () {
            await eventTicket.connect(organizer).markTicketUsed(0);

            await expect(
                eventTicket.connect(buyer1).resellTicket(0, buyer2.address, {
                    value: TICKET_PRICE
                })
            ).to.be.revertedWith("Ticket already used");
        });
    });

    describe("Organizer Withdrawals", function () {
        it("Should allow organizer to withdraw funds", async function () {
            // Mint some tickets
            await eventTicket.connect(buyer1).mintTicket(
                buyer1.address,
                "ipfs://ticket1",
                { value: TICKET_PRICE }
            );

            const organizerBalanceBefore = await ethers.provider.getBalance(organizer.address);

            const tx = await eventTicket.connect(organizer).withdraw();
            const receipt = await tx.wait();
            const gasCost = receipt.gasUsed * receipt.gasPrice;

            const organizerBalanceAfter = await ethers.provider.getBalance(organizer.address);

            expect(organizerBalanceAfter).to.be.closeTo(
                organizerBalanceBefore + TICKET_PRICE - gasCost,
                ethers.parseEther("0.001") // Small tolerance for gas variations
            );
        });
    });
});
