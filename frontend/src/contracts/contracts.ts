import EventFactoryABI from './EventFactoryABI.json';
import EventTicketABI from './EventTicketABI.json';

// Contract addresses from local deployment
// Update these after each deployment
export const CONTRACTS = {
    EventFactory: {
        address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        abi: EventFactoryABI,
    },
    EventTicket: {
        // EventTicket contracts are created dynamically via factory
        // Each event has its own contract address
        abi: EventTicketABI,
    },
};

// Local Hardhat network configuration
export const NETWORK_CONFIG = {
    chainId: 31337,
    chainName: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
};
