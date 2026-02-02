
import EventFactoryABI from './EventFactoryABI.json';
import EventTicketABI from './EventTicketABI.json';
export const CONTRACTS = {
    EventFactory: {
        // Địa chỉ EventFactory contract đã deploy lên Sepolia
        address: '0x33fDde77771520dD1fc11fCcCb60fbdcb731AB3f', // Sepolia
        abi: EventFactoryABI, // ABI để tương tác với contract
    },
    EventTicket: {
        // EventTicket contracts được tạo động qua Factory
        // Mỗi event có địa chỉ contract riêng
        // Lấy address từ getAllEvents() hoặc EventCreated event
        abi: EventTicketABI, // ABI dùng chung cho tất cả EventTicket contracts
    },
};


export const NETWORK_CONFIG = {
    chainId: 11155111,     // Chain ID của Sepolia (cố định)
    chainName: 'Sepolia',  // Tên network
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com', // Public RPC endpoint
};
