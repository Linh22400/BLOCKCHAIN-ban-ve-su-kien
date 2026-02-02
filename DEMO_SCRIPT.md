# 🎬 Demo Script - NFT Ticketing Platform Presentation

> **Mục đích:** Hướng dẫn step-by-step để demo dự án một cách mượt mà trước giảng viên/hội đồng.  
> **Thời gian:** 15-20 phút  
> **Chuẩn bị:** MetaMask, Sepolia ETH, localhost:3000 đã chạy

---

## 📋 Checklist Chuẩn Bị (Trước Buổi Present)

### ✅ Technical Setup
- [ ] `npm run dev` trong folder `frontend/` (port 3000)
- [ ] MetaMask installed & connected to Sepolia
- [ ] Có ít nhất **0.1 Sepolia ETH** trong ví (để demo mượt)
- [ ] Đã có sẵn **2 wallet accounts** trong MetaMask (Account 1 = Organizer, Account 2 = Buyer)
- [ ] Browser tabs chuẩn bị:
  - Tab 1: http://localhost:3000
  - Tab 2: https://sepolia.etherscan.io/address/0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f
- [ ] Clear browser cache (tránh hiện data cũ)

### ✅ Demo Data (Optional)
- [ ] Đã tạo sẵn 1 event để demo nhanh (hoặc tạo live)
- [ ] Có sẵn 1 vé đã mua để demo resale

---

## 🎯 Presentation Flow (20 phút)

### **Part 1: Giới Thiệu Dự Án** (3 phút)

#### 📢 **Nói:**
> "Em xin giới thiệu đồ án: **NFT Ticketing Platform** - Hệ thống bán vé sự kiện phi tập trung sử dụng blockchain Ethereum.
> 
> **Vấn đề giải quyết:**
> - ❌ Vé giả, gian lận
> - ❌ Scalping (mua rồi bán lại giá cao gấp nhiều lần)
> - ❌ Thiếu minh bạch trong giao dịch
> 
> **Giải pháp của em:**
> - ✅ Mỗi vé = 1 NFT duy nhất, không thể giả mạo
> - ✅ Có giá trần bán lại (`maxResalePrice`) - ngăn scalper
> - ✅ Hệ thống hoa hồng tự động cho người tổ chức
> - ✅ Mọi giao dịch công khai trên blockchain"

#### 💻 **Làm:**
1. Mở tab homepage (localhost:3000)
2. **Point chuột vào navbar**: "Đây là giao diện chính với các chức năng..."

---

### **Part 2: Smart Contracts Architecture** (2 phút)

#### 📢 **Nói:**
> "Về mặt kỹ thuật, em sử dụng **Factory Pattern** với 2 smart contracts:
> 
> 1. **EventFactory** - Quản lý tất cả events
> 2. **EventTicket** - Mỗi sự kiện có 1 contract riêng
> 
> Contracts đã được deploy lên **Sepolia Testnet** và em sẽ demo tương tác trực tiếp với blockchain."

#### 💻 **Làm:**
1. Chuyển sang tab Etherscan
2. **Point**: "Đây là contract address của EventFactory..."
3. Show contract code (nếu đã verify) hoặc Recent Transactions

**Screenshot location:** `0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f`

---

### **Part 3: Demo Use Case 1 - Người Tổ Chức** (5 phút)

#### Scenario: Tạo Sự Kiện Mới

#### 📢 **Nói:**
> "Bây giờ em sẽ demo vai trò **người tổ chức sự kiện**. 
> Em sẽ tạo một event mới, và khi submit sẽ deploy một smart contract mới lên blockchain."

#### 💻 **Làm:**

**Bước 1: Navigate to Admin → Create Event**
```
Click navbar: Admin > Create Event
```

**Bước 2: Connect Wallet**
```
1. Click "Connect Wallet" (nếu chưa connect)
2. MetaMask popup → Chọn Account 1 (Organizer)
3. Confirm connection
```

**Bước 3: Fill Form**
```
Event Name:       "Demo Concert 2026"
Date:             [Chọn ngày mai]
Time:             19:00
Location:         "Hanoi Convention Center"
Total Tickets:    100
Ticket Price:     0.01 ETH
Max Resale Price: 0.015 ETH    ← Point: "Chỉ cho phép bán lại tối đa 150%"
Royalty %:        10            ← Point: "Organizer nhận 10% mỗi lần resale"
Description:      "Live music event"
```

**Bước 4: Submit & Explain Transaction**
```
1. Click "Create Event"
2. MetaMask popup hiện lên
```

#### 📢 **Nói khi MetaMask popup:**
> "Đây là transaction cần ký. Chú ý gas fee - đây là chi phí để deploy contract lên blockchain.
> Em nhấn Confirm..."

```
3. Click Confirm
4. Chờ transaction processing
```

#### 📢 **Nói trong lúc chờ (10-15s):**
> "Transaction đang được miners xử lý... 
> Sau khi confirm, một smart contract mới sẽ được tạo ra với address riêng.
> Contract này sẽ lưu trữ tất cả thông tin của event và quản lý việc bán vé."

**Bước 5: Success**
```
✅ Toast hiện: "Event created successfully!"
→ Auto redirect to /events
```

#### 📢 **Nói:**
> "Như các thầy cô thấy, event đã được tạo thành công và xuất hiện trong danh sách.
> Event này bây giờ đã tồn tại vĩnh viễn trên blockchain Sepolia."

---

### **Part 4: Demo Use Case 2 - Người Mua Vé** (4 phút)

#### Scenario: Mua Vé NFT

#### 📢 **Nói:**
> "Tiếp theo em sẽ chuyển sang vai **người mua vé**.
> Em sẽ switch sang ví khác để demo."

#### 💻 **Làm:**

**Bước 1: Switch Account**
```
1. Click MetaMask extension
2. Chọn Account 2 (Buyer)
```

**Bước 2: View Event Details**
```
1. Click "View Details" trên event vừa tạo
2. Xem thông tin: Date, Location, Price, Available tickets
```

#### 📢 **Nói:**
> "Thông tin này được fetch real-time từ blockchain.
> Available tickets = Total - Đã bán."

**Bước 3: Buy Ticket**
```
1. Click "Buy Ticket"
2. MetaMask popup → Show gas + ticket price
```

#### 📢 **Nói:**
> "User phải trả **ticket price + gas fee**.
> Tiền sẽ được gửi đến địa chỉ của event contract."

```
3. Confirm transaction
4. Chờ confirmation (10-15s)
```

#### 📢 **Nói trong lúc chờ:**
> "Khi transaction success, một NFT ticket sẽ được mint vào ví của buyer.
> NFT này tuân thủ chuẩn ERC-721, có thể xem trong MetaMask tab NFTs."

**Bước 4: Verify Purchase**
```
✅ Success toast hiện
→ Available tickets giảm 1 (từ 100 → 99)
```

**Optional: Show MetaMask NFT**
```
1. Click MetaMask > NFTs tab
2. Show ticket NFT (nếu MetaMask đã detect)
```

---

### **Part 5: Demo Use Case 3 - Marketplace** (4 phút)

#### Scenario: Bán Lại Vé

#### 📢 **Nói:**
> "Bây giờ em sẽ demo tính năng **marketplace bán lại**.
> User có thể list vé để bán, nhưng giá không được vượt quá **maxResalePrice** mà organizer đã set."

#### 💻 **Làm:**

**Bước 1: Navigate to My Tickets**
```
Click navbar: My Tickets
```

**Bước 2: List Ticket**
```
1. Tìm ticket vừa mua (Account 2)
2. Click "Sell" button
3. Modal mở ra
```

**Bước 3: Set Price**
```
Nhập price: 0.012 ETH
```

#### 📢 **Nói:**
> "Em thử nhập 0.012 ETH - trong giới hạn 0.015 cho phép.
> Nếu em nhập 0.02, contract sẽ reject vì vượt max."

```
4. Click "List Ticket"
5. Confirm MetaMask
6. Wait for success
```

**Bước 4: View in Marketplace**
```
1. Navigate to "Marketplace"
2. Show ticket vừa list
```

#### 📢 **Nói:**
> "Ticket bây giờ xuất hiện trong marketplace public.
> Ai cũng có thể mua, trừ chính owner."

**Bước 5: Buy from Marketplace (Switch Account Again)**
```
1. Switch to Account 1 (hoặc Account 3 nếu có)
2. Click "Buy Ticket" trên listing
3. Confirm payment
```

#### 📢 **Nói khi confirm:**
> "Khi mua vé resale, hệ thống tự động:
> - Chuyển tiền cho người bán (90%)
> - Chuyển hoa hồng cho organizer (10%)
> - Transfer NFT ownership
> 
> Tất cả trong 1 transaction duy nhất."

**Bước 6: Verify**
```
→ Ticket biến mất khỏi marketplace
→ Check "My Tickets": Ticket đã chuyển sang người mua mới
→ Check "Sales History": Người bán thấy lịch sử bán với earnings
```

---

### **Part 6: Demo Check-in System** (2 phút)

#### 📢 **Nói:**
> "Cuối cùng, em demo hệ thống **check-in** cho organizer."

#### 💻 **Làm:**

**Bước 1: Switch to Organizer Account**
```
MetaMask → Account 1
```

**Bước 2: Navigate to Check-in**
```
Admin > Dashboard > [Chọn event] > Check-in
```

**Bước 3: Mark Ticket as Used**
```
1. Nhập wallet address của buyer (Account 2)
2. Click "Mark as Used"
3. Confirm transaction
```

#### 📢 **Nói:**
> "System validate:
> - Address có sở hữu ticket không?
> - Ticket đã dùng chưa?
> 
> Nếu OK, mark ticket = used. Sau đó ticket không thể check-in lại."

**Bước 4: Verify**
```
✅ Toast: "Ticket marked as used"
→ Try check-in lại → Sẽ báo "Already used"
```

---

## 🎤 Q&A Preparation (Dự Đoán Câu Hỏi)

### Câu hỏi 1: "Em có test security không?"

**Trả lời:**
> "Dạ có ạ. Em sử dụng **OpenZeppelin contracts** - đã được audit bởi cộng đồng.
> 
> Security measures:
> - **Access Control**: Chỉ owner mới mark ticket used
> - **Input Validation**: Require statements ở mọi function
> - **Reentrancy Protection**: Checks-Effects-Interactions pattern
> - **Price Ceiling**: Hard cap ngăn scalping
> 
> Em đã test các attack vectors như:
> - ❌ Người khác không thể mark vé của mình
> - ❌ Không thể list giá > maxResalePrice
> - ❌ Không thể double-use ticket"

---

### Câu hỏi 2: "Tại sao không dùng upgradeable contracts?"

**Trả lời:**
> "Em có research về **Proxy Pattern** (UUPS/Transparent),nhưng quyết định dùng **immutable contracts** vì:
> 
> 1. **Simplicity**: Code rõ ràng, dễ audit
> 2. **Gas-efficient**: Không có delegatecall overhead
> 3. **Security**: Tránh storage collision risks
> 
> Trade-off: Khi redeploy → address mới → mất data cũ.
> Nhưng đây phù hợp với testnet environment.
> 
> Production thì em sẽ cân nhắc upgradeable để có thể fix bugs."

---

### Câu hỏi 3: "Làm sao fetch được vé của user? Có dùng Enumerable không?"

**Trả lời:**
> "Em ban đầu muốn dùng **ERC721Enumerable** nhưng gặp conflict khi combine với URIStorage.
> 
> Thay vào đó, em implement **frontend solution**:
> - Dùng **multicall** để query `ownerOf()` cho tất cả tokenIDs
> - Filter ra những tickets thuộc user
> 
> Ưu điểm:
> - Contract đơn giản hơn (ít gas khi mint)
> - Linh hoạt filter ở frontend
> 
> Nhược điểm:
> - Query chậm hơn khi có 10,000+ tickets
> - Có thể optimize bằng The Graph indexer (future work)"

---

### Câu hỏi 4: "Royalty được distribute như thế nào?"

**Trả lời:**
> "Khi user mua vé resale, trong function `buyListedTicket()`:
> 
> ```solidity
> uint256 royalty = (price * royaltyPercentage) / 10000;
> uint256 sellerAmount = price - royalty;
> 
> payable(owner()).transfer(royalty);        // Organizer
> payable(ticketOwner).transfer(sellerAmount); // Seller
> ```
> 
> Ví dụ thực tế:
> - Price = 0.1 ETH
> - Royalty = 10%
> - Seller receives: 0.09 ETH
> - Organizer receives: 0.01 ETH
> 
> Fully automated, transparent on blockchain."

---

### Câu hỏi 5: "Frontend deploy ở đâu? Chạy thế nào?"

**Trả lời:**
> "Frontend em chạy **locally** với Next.js development server.
> 
> Deploy production có thể dùng:
> - **Vercel** (recommended cho Next.js)
> - **Netlify**
> - **IPFS** (fully decentralized)
> 
> Smart contracts đã deploy lên **Sepolia Testnet** nên ai cũng có thể interact, không nhất thiết phải dùng frontend của em."

---

## 📸 Backup Plan (Nếu Demo Bị Lỗi)

### Nếu MetaMask không connect:
1. Check browser console (F12)
2. Try hard refresh (Ctrl+Shift+R)
3. Fallback: Show **screenshots** đã chuẩn bị

### Nếu Transaction failed:
1. **Giải thích lỗi** (gas too low, insufficient funds, etc.)
2. Show **Etherscan transaction** đã thành công trước đó
3. Explain: "Đây là demo trên testnet, đôi khi network congestion..."

### Nếu Frontend không load:
1. Show **recording video** đã quay trước
2. Hoặc walk through **code** để explain logic

---

## ✅ Kết Thúc Presentation

#### 📢 **Nói:**
> "Em xin tóm tắt lại:
> 
> **Đã implement:**
> - ✅ Smart contracts with Factory pattern
> - ✅ NFT ticketing (ERC-721)
> - ✅ Anti-scalping mechanism
> - ✅ Automatic royalty system
> - ✅ Marketplace resale
> - ✅ Check-in validation
> - ✅ Full-stack Web3 integration
> 
> **Tech stack:**
> - Solidity, OpenZeppelin, Hardhat
> - Next.js, TypeScript, Wagmi, Viem
> - Deployed on Sepolia Testnet
> 
> **Kết quả:**
> - Giải quyết được vấn đề vé giả, scalping
> - Transparency toàn bộ giao dịch
> - User truly owns their tickets (NFT in wallet)
> 
> Em xin cảm ơn thầy cô đã lắng nghe. Em sẵn sàng trả lời câu hỏi ạ!"

---

## 🎯 Tips Để Present Tốt

### ✅ DO:
- **Practice trước** ít nhất 2 lần để thuộc flow
- **Nói chậm, rõ ràng** - không nói quá nhanh
- **Point chuột** vào những gì đang giải thích
- **Giải thích WHY** không chỉ WHAT (ví dụ: tại sao dùng Factory pattern)
- **Tự tin** - đây là sản phẩm BẠN làm ra!

### ❌ DON'T:
- Đọc script y nguyên (sẽ khô khan)
- Dùng quá nhiều thuật ngữ kỹ thuật không giải thích
- Im lặng khi chờ transaction (phải explain)
- Panic nếu có lỗi - giải thích bình tĩnh

---

## 🎬 Timeline Checklist During Demo

| Thời gian | Action | Expected Result |
|-----------|--------|-----------------|
| 0:00-3:00 | Intro + Architecture | Slide/Diagram |
| 3:00-8:00 | Create Event Demo | New event in list |
| 8:00-12:00 | Buy Ticket Demo | NFT minted |
| 12:00-16:00 | Marketplace Demo | List → Buy flow |
| 16:00-18:00 | Check-in Demo | Ticket marked used |
| 18:00-20:00 | Q&A | Answer questions |

---

## 📝 Final Checklist Before Demo

- [ ] Đọc script này 1 lần
- [ ] Practice demo 1 lần không ngắt quãng
- [ ] Chuẩn bị answers cho 5 câu hỏi phổ biến trên
- [ ] Screenshot backup key screens
- [ ] Test tất cả functionality 1 lần cuối
- [ ] Ngủ đủ giấc 😴

**Good luck! Bạn làm được! 💪**
