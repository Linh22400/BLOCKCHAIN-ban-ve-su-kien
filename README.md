# 🎫 NFT Ticketing Platform - Blockchain Event Ticketing System

> Hệ thống bán vé sự kiện phi tập trung sử dụng NFT trên Ethereum blockchain với marketplace bán lại, chống scalping, và hoa hồng tự động.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-blue)](https://sepolia.etherscan.io/)

## 📋 Tổng Quan

NFT Ticketing Platform là một ứng dụng full-stack blockchain cho phép:
- 🎟️ **Tạo và bán vé sự kiện** dưới dạng NFT (ERC-721)
- 🛒 **Marketplace bán lại** với giá trần chống scalping
- 💰 **Hệ thống hoa hồng** tự động cho người tổ chức
- ✅ **Check-in kỹ thuật số** để xác thực vé
- 📊 **Dashboard quản lý** cho organizer

---

## ✨ Tính Năng Chính

### Smart Contracts
- ✅ **ERC-721 NFT Tickets** - Mỗi vé là một NFT duy nhất
- ✅ **Factory Pattern** - EventFactory tạo và quản lý nhiều sự kiện
- ✅ **Anti-Scalping** - Giá trần bán lại (`maxResalePrice`)
- ✅ **Royalty System** - % hoa hồng tự động cho organizer khi resale
- ✅ **Access Control** - Owner-only functions với OpenZeppelin Ownable
- ✅ **Security** - Sử dụng audited contracts từ OpenZeppelin

### Frontend
- ✅ **Wallet Integration** - RainbowKit + MetaMask support
- ✅ **Real-time Updates** - Transaction tracking & auto-refresh
- ✅ **Marketplace** - Browse và mua vé đã list
- ✅ **My Tickets** - Quản lý NFT tickets + Sales history
- ✅ **Admin Panel** - Tạo sự kiện, check-in, analytics
- ✅ **Toast Notifications** - User feedback mượt mà

---

## 🛠️ Tech Stack

### Blockchain
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin Contracts** - Secure, audited libraries
- **Sepolia Testnet** - Ethereum test network

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **RainbowKit** - Wallet connection UI
- **TailwindCSS** - Styling
- **Sonner** - Toast notifications

---

## 📦 Cấu Trúc Dự Án

```
BLOCKCHAIN-ban-ve-su-kien/
├── smart-contracts/           # Smart contracts & deployment
│   ├── contracts/
│   │   ├── EventFactory.sol   # Factory quản lý events
│   │   └── EventTicket.sol    # ERC-721 NFT ticket contract
│   ├── scripts/
│   │   ├── deploy.js          # Deploy script
│   │   └── copy-abi.js        # Sync ABIs to frontend
│   ├── hardhat.config.js
│   └── .env                   # RPC URL & Private Key
│
└── frontend/                  # Next.js application
    ├── src/
    │   ├── app/               # Pages (Next.js App Router)
    │   │   ├── page.tsx       # Homepage
    │   │   ├── events/        # Events listing & details
    │   │   ├── marketplace/   # Ticket resale marketplace
    │   │   ├── my-tickets/    # User's NFT tickets
    │   │   └── admin/         # Organizer dashboard & check-in
    │   ├── components/        # Reusable components
    │   ├── hooks/             # Web3 hooks (useEventTicket, etc.)
    │   ├── contracts/         # ABIs & contract addresses
    │   └── utils/             # Helper functions
    └── package.json
```

---

## 🚀 Cài Đặt và Chạy

### Prerequisites
- Node.js 18+ và npm
- MetaMask extension
- Sepolia Testnet ETH (faucet: [sepoliafaucet.com](https://sepoliafaucet.com))

### 1. Clone Repository
```bash
git clone <repository-url>
cd BLOCKCHAIN-ban-ve-su-kien
```

### 2. Setup Smart Contracts
```bash
cd smart-contracts
npm install

# Tạo file .env
cp .env.example .env
# Thêm PRIVATE_KEY (MetaMask private key)
# SEPOLIA_RPC_URL đã có sẵn

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Sync ABIs to frontend
node scripts/copy-abi.js
```

**Deployed Contract:** `0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f` (Sepolia)

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Run development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

---

## 📖 Hướng Dẫn Sử Dụng

### Cho Người Tổ Chức (Organizer)

#### 1. Tạo Sự Kiện
1. Connect wallet qua RainbowKit
2. Navigate to **Admin → Create Event**
3. Điền thông tin:
   - Tên sự kiện, địa điểm, thời gian
   - Số lượng vé
   - Giá vé (ETH)
   - Giá trần bán lại (anti-scalping)
   - % hoa hồng (royalty)
4. Click **Create Event** → Confirm transaction
5. Contract mới sẽ được deploy

#### 2. Check-in Vé
1. Navigate to **Admin → Dashboard**
2. Chọn sự kiện cần check-in
3. Nhập **wallet address** của người tham dự
4. Click **Mark as Used**

### Cho Người Mua (Customer)

#### 1. Mua Vé
1. Browse **Events** page
2. Click **View Details** trên event
3. Connect wallet
4. Click **Buy Ticket** → Pay ETH + gas
5. NFT ticket được mint vào wallet

#### 2. Xem Vé Của Tôi
1. Navigate to **My Tickets**
2. Xem tất cả NFT tickets owned

#### 3. Bán Lại Vé
1. Trong **My Tickets**, click **Sell** trên vé
2. Nhập giá (tối đa = `maxResalePrice`)
3. Confirm transaction
4. Vé xuất hiện trong **Marketplace**

#### 4. Mua Vé Từ Marketplace
1. Navigate to **Marketplace**
2. Browse vé đang bán
3. Click **Buy Ticket** → Pay
4. Ownership transfer + royalty tự động

---

## 🔐 Smart Contract Functions

### EventFactory.sol
```solidity
createEvent(...)           // Tạo event mới (deploy EventTicket contract)
getAllEvents()             // Lấy tất cả events
getOrganizerEvents(addr)   // Lấy events của 1 organizer
```

### EventTicket.sol
```solidity
// Primary Sales
mintTicket(to, tokenURI)   // Mua vé, mint NFT

// Marketplace
listTicket(tokenId, price) // Đăng bán vé
unlistTicket(tokenId)      // Hủy đăng bán
buyListedTicket(tokenId)   // Mua vé đã list (auto royalty)

// Admin
markTicketUsed(tokenId)    // Check-in vé
isTicketValid(tokenId, user) // Validate ownership
withdraw()                 // Organizer rút tiền
```

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Tạo event mới từ admin panel
- [x] Mua vé trực tiếp từ event
- [x] List vé lên marketplace
- [x] Mua vé từ marketplace
- [x] Verify royalty payment
- [x] Check-in vé đã sử dụng
- [x] View sales history

### Test trên Sepolia
```bash
# Get Sepolia ETH từ faucet
https://sepoliafaucet.com

# Check deployment
https://sepolia.etherscan.io/address/0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f
```

---

## 🎯 Use Cases

### Use Case 1: Concert Event
- Organizer tạo event "Summer Music Festival"
- Bán 1000 vé @ 0.05 ETH
- Set max resale = 0.06 ETH (chỉ cho phép markup 20%)
- Set royalty = 10% (organizer nhận 10% mỗi lần resale)

### Use Case 2: Resale Prevention
- Scalper mua 100 vé
- Cố bán @ 0.5 ETH (gấp 10 lần)
- ❌ Transaction bị reject vì > `maxResalePrice`

### Use Case 3: Royalty Distribution
- Alice mua vé @ 0.05 ETH
- Alice bán lại cho Bob @ 0.06 ETH
- Bob pay 0.06 ETH:
  - Alice nhận: 0.054 ETH (90%)
  - Organizer nhận: 0.006 ETH (10% royalty)

---

## 🔒 Security Features

- ✅ **OpenZeppelin Libraries** - Industry-standard audited code
- ✅ **Ownable Access Control** - Only organizer can admin functions
- ✅ **Reentrancy Protection** - Checks-effects-interactions pattern
- ✅ **Input Validation** - Require statements on all public functions
- ✅ **Price Ceiling** - Hard cap on resale prices
- ✅ **Transfer Restrictions** - Tickets can only be sold through contract

---

## 📊 Architecture

```
┌─────────────┐
│  Frontend   │
│  (Next.js)  │
└──────┬──────┘
       │ Wagmi/Viem
       ↓
┌─────────────────┐
│  Sepolia        │
│  Testnet        │
├─────────────────┤
│ EventFactory    │ ← Tạo và quản lý events
│ 0x33fD...AB3f   │
└────────┬────────┘
         │ createEvent()
         ↓
┌─────────────────┐
│ EventTicket     │ ← NFT contract cho từng event
│ (ERC-721)       │
└─────────────────┘
```

---

## 🐛 Known Limitations

1. **Non-Upgradeable Contracts**
   - Mỗi deploy tạo address mới
   - Redeploy = mất data trên testnet cũ
   - ✅ Design choice phù hợp cho learning project

2. **No Refund Mechanism**
   - Vé đã mua không thể refund
   - Chỉ có thể bán lại trên marketplace

3. **No Ticket Transfer Between Wallets**
   - NFT transfer disabled (override locked)
   - Chỉ transfer qua marketplace functions

---

## 🚧 Future Improvements

- [ ] UUPS Upgradeable Proxy Pattern
- [ ] IPFS integration cho ticket metadata
- [ ] QR code generation cho check-in
- [ ] Email notifications
- [ ] Multi-signature admin
- [ ] Gasless meta-transactions (EIP-2771)

---

## 📝 License

MIT License - Free to use for educational purposes

---

## 👥 Contributors

- **Linh22400** - Full-stack development

---

## 📞 Support

Nếu gặp vấn đề:
1. Check MetaMask đang ở Sepolia network
2. Đảm bảo có đủ Sepolia ETH
3. Clear browser cache và reconnect wallet
4. Check console logs (F12) để debug

**Contract Address (Sepolia):**  
`0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f`

**Etherscan:**  
https://sepolia.etherscan.io/address/0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f

---

## 🎓 Đồ Án Tốt Nghiệp

Dự án này được phát triển như một đồ án tốt nghiệp về ứng dụng Blockchain trong hệ thống bán vé sự kiện, giải quyết các vấn đề:
- ✅ Gian lận vé giả
- ✅ Scalping (mua đi bán lại với giá cao)
- ✅ Thiếu minh bạch
- ✅ Phí trung gian cao

**Tech Demo:** Hoàn toàn functional trên Sepolia Testnet
