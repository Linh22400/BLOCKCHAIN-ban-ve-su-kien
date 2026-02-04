# 📘 Hướng Dẫn Báo Cáo Dự Án - Blockchain Event Ticketing

> **Mục đích:** Giúp bạn tự tin trả lời mọi câu hỏi của giảng viên khi demo dự án

---

## 🎯 Tổng Quan Dự Án (30 giây)

**Dự án là gì?**
- Hệ thống bán vé sự kiện sử dụng công nghệ **Blockchain** và **NFT**
- Giải quyết vấn đề: **Vé giả**, **Phe vé**, **Không minh bạch**

**Công nghệ:**
- **Backend:** Smart Contracts (Solidity) trên Ethereum
- **Frontend:** Next.js + React + TypeScript
- **Blockchain:** Sepolia Testnet (Ethereum test network)

**3 Tính năng chính:**
1. **Organizer** tạo event & bán vé
2. **User** mua vé (NFT) và có thể bán lại
3. **Admin** check-in vé tại sự kiện

---

## 💡 Kiến Thức Blockchain Cơ Bản (Cần Biết)

### 1. Blockchain là gì?
**Định nghĩa đơn giản:** Sổ cái điện tử phân tán, không ai sửa được
- Giống như Google Docs nhưng **không ai có quyền xóa/sửa** sau khi viết
- Mọi người đều có bản copy → **minh bạch**

### 2. Smart Contract là gì?
**Định nghĩa:** Chương trình chạy tự động trên blockchain
- **Ví dụ thực tế:** Máy bán nước tự động
  - Cho tiền → Nhận nước (tự động, không cần người)
  - Smart Contract: Trả tiền → Nhận vé (tự động, không cần trung gian)

### 3. NFT là gì?
**Định nghĩa:** Token độc nhất, không thể thay thế
- **Ví dụ:** Vé concert của bạn là NFT #5, khác với NFT #6
- Mỗi vé có **ID riêng**, chứng minh quyền sở hữu

### 4. Gas Fee là gì?
**Định nghĩa:** Phí trả cho miners để xử lý transaction
- **Ví dụ:** Như phí chuyển tiền ngân hàng
- Sepolia testnet: **Miễn phí** (ETH fake)

### 5. Wallet (Ví) là gì?
**Định nghĩa:** Ứng dụng lưu trữ tiền điện tử & NFT
- **Dự án dùng:** MetaMask
- **Giống như:** Ví điện tử MoMo nhưng cho crypto

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                 │
│  - Giao diện web                                │
│  - Kết nối ví MetaMask                          │
│  - Gọi Smart Contracts                          │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│         BLOCKCHAIN (Sepolia Testnet)            │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  EventFactory.sol                         │ │
│  │  - Tạo events mới                         │ │
│  │  - Quản lý danh sách events               │ │
│  └───────────────┬───────────────────────────┘ │
│                  │                              │
│                  ↓                              │
│  ┌───────────────────────────────────────────┐ │
│  │  EventTicket.sol (cho mỗi event)          │ │
│  │  - Mint vé NFT                            │ │
│  │  - Bán/Mua vé                             │ │
│  │  - Check-in                               │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Dự Án & Giải Thích Files

### Smart Contracts (Backend - Blockchain)

```
smart-contracts/
├── contracts/
│   ├── EventFactory.sol      ← Tạo events (1 contract duy nhất)
│   └── EventTicket.sol       ← Quản lý vé NFT (mỗi event 1 contract)
├── scripts/
│   └── deploy.js             ← Script deploy contracts lên blockchain
└── hardhat.config.js         ← Cấu hình Hardhat (tool dev blockchain)
```

**EventFactory.sol làm gì?**
- Giống như "nhà máy" sản xuất events
- Mỗi lần tạo event → Deploy 1 EventTicket contract mới
- Lưu danh sách tất cả events

**EventTicket.sol làm gì?**
- Quản lý vé cho 1 event cụ thể
- Mint vé (như in vé)
- Bán/Mua vé giữa users
- Check-in vé tại sự kiện

### Frontend (Giao diện)

```
frontend/src/
├── app/                      ← Pages (trang web)
│   ├── page.tsx             ← Homepage
│   ├── events/[id]/         ← Chi tiết event & mua vé
│   ├── marketplace/         ← Chợ vé (mua từ người khác)
│   ├── my-tickets/          ← Vé của tôi
│   └── admin/               ← Admin: Tạo event, Check-in
├── hooks/                    ← Logic tương tác blockchain
│   ├── useEventFactory.ts   ← Tạo event, lấy danh sách events
│   └── useEventTicket.ts    ← Mua/bán vé, check-in
├── utils/                    ← Hàm hỗ trợ
│   ├── fetchUserTickets.ts  ← Lấy vé của user từ blockchain
│   └── fetchListedTickets.ts← Lấy vé đang bán
└── contracts/                ← ABI & địa chỉ contracts
    └── contracts.ts         ← Cấu hình contract addresses
```

---

## 🔄 Luồng Hoạt Động Chính

### Luồng 1: Organizer Tạo Event

```
1. Organizer vào /admin/create
2. Điền form: Tên event, giá vé, số lượng, địa điểm, ngày
3. Click "Tạo Event"
4. MetaMask popup → Confirm transaction
5. EventFactory deploy EventTicket contract mới
6. Event xuất hiện trên homepage
```

**Code liên quan:** `useEventFactory.ts` → `createEvent()`

### Luồng 2: User Mua Vé (Primary Sale)

```
1. User click vào event → Trang chi tiết
2. Click "Mua Vé" 
3. MetaMask popup → Xác nhận gửi ETH
4. Smart contract mint NFT ticket
5. Vé xuất hiện trong "My Tickets"
```

**Code liên quan:** `useEventTicket.ts` → `mintTicket()`

### Luồng 3: User Bán Lại Vé (Secondary Market)

```
1. User vào "My Tickets"
2. Click "Bán" trên vé
3. Nhập giá bán (≤ maxResalePrice)
4. MetaMask confirm
5. Vé xuất hiện trên Marketplace
```

**Code liên quan:** `useEventTicket.ts` → `listTicket()`

### Luồng 4: User Mua Vé Từ Marketplace

```
1. User vào Marketplace
2. Thấy vé đang bán, click "Mua"
3. MetaMask confirm (trả tiền)
4. Smart contract auto:
   - Trừ royalty cho organizer (5%)
   - Chuyển còn lại cho seller (95%)
   - Transfer NFT cho buyer
```

**Code liên quan:** `useEventTicket.ts` → `buyListedTicket()`

### Luồng 5: Admin Check-in Vé

```
1. Admin vào /admin/checkin/[eventId]
2. Nhập Token ID của vé
3. Click "Check-in"
4. Smart contract đánh dấu vé đã sử dụng
5. Vé không thể check-in lần 2
```

**Code liên quan:** `useEventTicket.ts` → `markTicketUsed()`

---

## 🛡️ Tính Năng Bảo Mật & Chống Gian Lận

### 1. Chống Phe Vé (Anti-Scalping)
**Vấn đề:** Người mua vé rồi bán lại giá cao
**Giải pháp:** Giá bán lại không được vượt quá `maxResalePrice`
```solidity
require(price <= maxResalePrice, "Giá vượt mức cho phép");
```

### 2. Royalty System
**Vấn đề:** Organizer mất revenue khi vé bán lại
**Giải pháp:** Organizer nhận % từ mọi giao dịch secondary
```solidity
uint256 royalty = (price * royaltyPercentage) / 10000;
payable(owner()).transfer(royalty); // Chuyển cho organizer
```

### 3. Check-in Một Lần
**Vấn đề:** Dùng vé nhiều lần
**Giải pháp:** Đánh dấu `ticketUsed = true`, không check-in lại được
```solidity
require(!ticketUsed[tokenId], "Vé đã dùng rồi");
ticketUsed[tokenId] = true;
```

### 4. Quyền Sở Hữu Minh Bạch
**Vấn đề:** Vé giả
**Giải pháp:** NFT trên blockchain → Ai cũng verify được owner

---

## ❓ Câu Hỏi Giảng Viên Thường Hỏi & Cách Trả Lời

### Q1: "Tại sao dùng blockchain? Dùng database thông thường không được à?"

**Trả lời:**
"Blockchain có 3 ưu điểm database không có:
1. **Minh bạch**: Ai cũng xem được lịch sử giao dịch vé
2. **Không thể sửa**: Không ai fake vé được, kể cả admin
3. **Phân quyền**: Không cần server trung tâm, user sở hữu vé thực sự"

### Q2: "Smart contract hoạt động như thế nào?"

**Trả lời:**
"Smart contract giống như máy bán nước tự động:
- **Input:** User gửi ETH + gọi function `mintTicket()`
- **Process:** Contract check đủ tiền không, còn vé không
- **Output:** Tạo NFT vé, trả về cho user
- **Tự động 100%**, không cần admin can thiệp"

### Q3: "Gas fee là gì? Tốn kém không?"

**Trả lời:**
"Gas fee là phí trả cho miners xử lý transaction.
- **Trên mainnet:** Tốn tiền thật (vài $)
- **Trên Sepolia testnet (dự án này):** Miễn phí, ETH fake
- **Trong production:** Có thể dùng layer 2 (Polygon) để giảm phí ~100 lần"

### Q4: "NFT ở đây khác gì với NFT tranh ảnh?"

**Trả lời:**
"NFT chỉ là công nghệ, ứng dụng khác nhau:
- **NFT tranh:** Chứng nhận quyền sở hữu tác phẩm nghệ thuật
- **NFT vé (dự án này):** Chứng nhận quyền vào sự kiện
- **Cùng công nghệ (ERC-721)**, khác use case"

### Q5: "Làm sao chống được phe vé?"

**Trả lời:**
"Có 2 cơ chế:
1. **Price Ceiling:** Giá bán lại không vượt quá `maxResalePrice`
2. **Royalty:** Organizer nhận % từ resale → Giảm động lực phe vé
   
Code: `require(price <= maxResalePrice, 'Vượt giá');`"

### Q6: "Nếu mất điện thoại thì mất vé à?"

**Trả lời:**
"Không mất! Vé ở trên blockchain, không phải trong máy.
- **Backup:** Ghi lại seed phrase (12 từ) của MetaMask
- **Khôi phục:** Import seed phrase vào máy mới → Vé vẫn còn
- Giống như Google Account, mật khẩu đúng vào máy nào cũng được"

### Q7: "Demo cho em xem luồng mua vé?"

**Trả lời & Demo:**
1. Mở trang event → "Vẫn còn 50/100 vé"
2. Click "Mua Vé" → MetaMask popup
3. Confirm → Chờ ~10 giây (testnet nhanh)
4. Vào "My Tickets" → Vé #23 xuất hiện
5. Mở block explorer → Link transaction hash

### Q8: "Code này phức tạp không?"

**Trả lời:**
"Code có cấu trúc rõ ràng:
- **Smart Contract (Solidity):** ~300 lines, có comments tiếng Việt
- **Frontend (React):** Dùng hooks để tách logic
- **Complexity:** Medium - Phù hợp đồ án tốt nghiệp CNTT

Tất cả đều có comments giải thích, em có thể giải thích bất kỳ đoạn nào."

### Q9: "Tại sao chọn Sepolia testnet?"

**Trả lời:**
"Sepolia là testnet chính thức của Ethereum:
- **Miễn phí:** Không tốn tiền thật
- **Giống mainnet:** Công nghệ tương tự, test đầy đủ
- **Dễ debug:** Block explorer rõ ràng
- **Production:** Chỉ cần đổi RPC URL là deploy lên mainnet được"

### Q10: "Khó khăn lớn nhất khi làm đồ án?"

**Trả lời:**
"3 khó khăn chính:
1. **Học Solidity:** Ngôn ngữ mới, khác JavaScript
2. **Transaction lifecycle:** Hiểu flow async (pending → confirming → success)
3. **Multicall optimization:** Giảm RPC calls để tăng tốc

Nhưng đã giải quyết được qua docs + ChatGPT + debug nhiều."

---

## 🎬 Checklist Demo Trước Giảng Viên

### Chuẩn bị trước:
- [ ] MetaMask đã cài, có Sepolia ETH
- [ ] Frontend đang chạy (`npm run dev`)
- [ ] Đã tạo sẵn 1-2 events test
- [ ] Đã mua vé để có trong "My Tickets"
- [ ] Mở block explorer (Sepolia Etherscan) sẵn

### Flow demo chuẩn (5-10 phút):
1. **Giới thiệu** (30s): "Dự án bán vé blockchain chống giả, chống phe vé"
2. **Tạo Event** (1 phút): Admin create event form → Transaction → Event xuất hiện
3. **Mua Vé** (1 phút): User mua vé → MetaMask → NFT về ví
4. **Bán Vé** (1 phút): List vé lên marketplace với giá
5. **Mua Từ Marketplace** (1 phút): User khác mua → Royalty auto split
6. **Check-in** (1 phút): Admin check-in vé → Không dùng được lần 2
7. **Show Blockchain** (1 phút): Mở transaction trên Etherscan → Minh bạch

---

## 📝 Tips Thuyết Trình

### DO ✅
- Nói tự tin, rõ ràng
- Giải thích bằng ví dụ thực tế (máy bán nước, ví MoMo)
- Có demo sẵn, flow suôn sẻ
- Nhấn mạnh **vấn đề giải quyết** hơn là công nghệ

### DON'T ❌
- Dùng thuật ngữ quá khó (cryptographic hash, merkle tree,...)
- Nói blockchain quá phức tạp → Mất điểm
- Demo bug → Luôn test trước!
- Đọc slides → Nhìn giảng viên

### Câu kết đẹp:
"Dự án này chứng minh blockchain không chỉ là crypto trading, mà  thực sự giải quyết được vấn đề thực tế: **Vé giả, phe vé, không minh bạch**. Em tin đây là công nghệ tương lai cho ngành event & ticketing."

---

## 🔗 Links Quan Trọng

- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **MetaMask:** https://metamask.io
- **Sepolia Faucet:** https://sepoliafaucet.com
- **Smart  Contract deployed:** `0x33fDde77771520dD1fc11fCcCb60fbdcb731AB3f`

---

**Chúc bạn demo thành công! 🎉**
