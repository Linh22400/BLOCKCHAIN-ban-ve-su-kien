import EventFactoryABI from './EventFactoryABI.json';
import EventTicketABI from './EventTicketABI.json';

// Contract addresses from local deployment
// Update these after each deployment
export const CONTRACTS = {
    EventFactory: {
        address: '0x33fDde77771520dD1fc11fCcCb60fbdcb731AB3f', // Sepolia - Marketplace V3 (Public Node)
        abi: EventFactoryABI,
    },
    EventTicket: {
        // EventTicket contracts are created dynamically via factory
        // Each event has its own contract address
        abi: EventTicketABI,
    },
};

// Network configuration for Sepolia
export const NETWORK_CONFIG = {
    chainId: 11155111,
    chainName: 'Sepolia',
    rpcUrl: 'https://eth-sepolia-testnet.api.pocket.network', // Public RPC
};
