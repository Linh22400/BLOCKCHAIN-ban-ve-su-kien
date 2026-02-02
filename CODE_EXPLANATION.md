# 💻 Code Explanation - Hiểu Toàn Bộ Source Code

> **Mục đích:** Giải thích chi tiết từng file/function quan trọng để bạn có thể trả lời mượt mà khi giảng viên hỏi code.

---

## 📚 Mục Lục

1. [Smart Contracts](#smart-contracts)
   - EventFactory.sol
   - EventTicket.sol
2. [Frontend Hooks](#frontend-hooks)
   - useEventFactory.ts
   - useEventTicket.ts
3. [Utility Functions](#utility-functions)
   - fetchUserTickets
   - fetchListedTickets
   - fetchSoldTickets
4. [Key Pages](#key-pages)
   - Events Page
   - Marketplace Page
   - My Tickets Page
   - Admin Create Event

---

## 🔗 Smart Contracts

### EventFactory.sol

**Vai trò:** Factory pattern - Tạo và quản lý nhiều EventTicket contracts

#### State Variables

```solidity
address[] public events;
mapping(address => address[]) public organizerEvents;
```

**Giải thích:**
- `events[]`: Mảng lưu địa chỉ của TẤT CẢ EventTicket contracts đã tạo
- `organizerEvents`: Mapping từ địa chỉ organizer → mảng events của họ
  - Ví dụ: `organizerEvents[0xABC...]` = `[0x111..., 0x222...]` (organizer 0xABC có 2 events)

---

#### Function: createEvent()

```solidity
function createEvent(
    string memory _name,
    string memory _symbol,
    string memory _eventName,
    uint256 _eventDate,
    string memory _eventLocation,
    uint256 _ticketPrice,
    uint256 _maxResalePrice,
    uint256 _royaltyPercentage,
    uint256 _totalTickets
) public returns (address) {
    // 1. Deploy contract mới
    EventTicket newEvent = new EventTicket(
        _name, _symbol, _eventName, _eventDate, 
        _eventLocation, _ticketPrice, _maxResalePrice,
        _royaltyPercentage, _totalTickets
    );
    
    // 2. Transfer ownership cho người gọi
    newEvent.transferOwnership(msg.sender);
    
    // 3. Lưu vào storage
    address eventAddress = address(newEvent);
    events.push(eventAddress);
    organizerEvents[msg.sender].push(eventAddress);
    
    // 4. Emit event để frontend biết
    emit EventCreated(eventAddress, msg.sender, _eventName);
    
    return eventAddress;
}
```

**Giải thích từng bước:**

1. **`new EventTicket(...)`**: Deploy một smart contract MỚI lên blockchain
   - Mỗi lần call = 1 contract address mới
   - Contract này độc lập, có storage riêng
   
2. **`transferOwnership(msg.sender)`**: 
   - `msg.sender` = người gọi function (organizer)
   - Transfer quyền owner từ Factory → Organizer
   - Chỉ owner mới call được các admin functions
   
3. **Lưu vào arrays:**
   - `events.push()`: Thêm vào danh sách public
   - `organizerEvents[msg.sender].push()`: Track events của người tạo
   
4. **`emit EventCreated`**: Phát event log
   - Frontend lắng nghe event này để biết khi nào tạo xong

**Khi giảng viên hỏi:** "Tại sao dùng Factory Pattern?"

**Trả lời:**
> "Em dùng Factory để:
> 1. **Tái sử dụng code** - Không cần deploy lại toàn bộ contract cho mỗi event
> 2. **Quản lý dễ** - Có danh sách tập trung tất cả events
> 3. **Gas-efficient** - Deploy bytecode một lần, sau đó chỉ cần call function
> 4. **Ownership rõ ràng** - Mỗi event có organizer riêng"

---

### EventTicket.sol

**Vai trò:** NFT contract (ERC-721) cho từng event cụ thể

#### Constructor

```solidity
constructor(
    string memory _name,
    string memory _symbol,
    string memory _eventName,
    uint256 _eventDate,
    string memory _eventLocation,
    uint256 _ticketPrice,
    uint256 _maxResalePrice,
    uint256 _royaltyPercentage,
    uint256 _totalTickets
) ERC721(_name, _symbol) Ownable(msg.sender) {
    eventName = _eventName;
    eventDate = _eventDate;
    eventLocation = _eventLocation;
    ticketPrice = _ticketPrice;
    maxResalePrice = _maxResalePrice;
    royaltyPercentage = _royaltyPercentage;
    totalTickets = _totalTickets;
}
```

**Giải thích:**
- `ERC721(_name, _symbol)`: Gọi constructor của parent contract OpenZeppelin ERC721
- `Ownable(msg.sender)`: Set deployer (Factory) làm owner ban đầu
- Lưu tất cả params vào state variables - data này **immutable** sau khi deploy

---

#### Function: mintTicket()

```solidity
function mintTicket(address to, string memory tokenURI) public payable {
    // 1. Validation
    require(msg.value >= ticketPrice, "Insufficient payment");
    require(_tokenIdCounter < totalTickets, "Sold out");
    
    // 2. Mint NFT
    uint256 tokenId = _tokenIdCounter;
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, tokenURI);
    
    // 3. Update state
    ticketOriginalPrice[tokenId] = ticketPrice;
    _tokenIdCounter++;
    
    // 4. Emit event
    emit TicketMinted(to, tokenId);
}
```

**Giải thích chi tiết:**

**Line 1-2 (Validation):**
```solidity
require(msg.value >= ticketPrice, "Insufficient payment");
```
- `msg.value`: Số ETH (wei) user gửi kèm transaction
- `require()`: Nếu điều kiện false → revert toàn bộ transaction
- Ví dụ: `ticketPrice = 0.01 ETH`, user chỉ gửi `0.005 ETH` → Transaction fail

```solidity
require(_tokenIdCounter < totalTickets, "Sold out");
```
- `_tokenIdCounter`: Số vé đã mint (bắt đầu từ 0)
- Ví dụ: `totalTickets = 100`, đã mint 99 vé → `_tokenIdCounter = 99` → OK
- Khi mint vé thứ 100 → `_tokenIdCounter = 100` → **SOLD OUT**

**Line 2 (Mint NFT):**
```solidity
_safeMint(to, tokenId);
```
- `_safeMint()`: OpenZeppelin function
- Tạo NFT với ID = `tokenId`, gửi cho `to`
- "Safe" = check nếu `to` là contract, phải implement `onERC721Received()`

```solidity
_setTokenURI(tokenId, tokenURI);
```
- Set metadata URI cho NFT (link đến JSON file)
- Ví dụ: `"ipfs://QmXyz.../metadata.json"`

**Line 3 (Update state):**
```solidity
ticketOriginalPrice[tokenId] = ticketPrice;
```
- Lưu giá gốc vé này vào mapping
- Dùng để tính royalty sau này

**Khi giảng viên hỏi:** "Tại sao dùng `payable`?"

**Trả lời:**
> "Modifier `payable` cho phép function nhận ETH.
> Nếu không có `payable`, user gửi ETH → transaction fail.
> `msg.value` chứa số ETH được gửi kèm, em dùng để validate payment."

---

#### Function: listTicket()

```solidity
function listTicket(uint256 tokenId, uint256 price) public {
    require(ownerOf(tokenId) == msg.sender, "Not owner");
    require(!ticketUsed[tokenId], "Ticket already used");
    require(price > 0, "Invalid price");
    require(price <= maxResalePrice, "Exceeds max resale price");
    
    ticketPrices[tokenId] = price;
    emit TicketListed(tokenId, price, msg.sender);
}
```

**Giải thích:**

**Line 1: Ownership check**
```solidity
require(ownerOf(tokenId) == msg.sender, "Not owner");
```
- `ownerOf(tokenId)`: ERC721 function trả về address của owner
- `msg.sender`: Người đang gọi function
- CHỈ owner mới được list vé của mình

**Line 2: Check đã sử dụng chưa**
```solidity
require(!ticketUsed[tokenId], "Ticket already used");
```
- `ticketUsed[tokenId]`: Boolean mapping
- `!ticketUsed` = NOT used = OK
- Nếu đã check-in → không được bán lại

**Line 4: Anti-scalping**
```solidity
require(price <= maxResalePrice, "Exceeds max resale price");
```
- **ĐÂY LÀ ĐIỂM MẠNH CỦA DỰ ÁN**
- `maxResalePrice`: Set bởi organizer khi tạo event
- Hard cap ngăn scalper bán giá cắt cổ
- Ví dụ: `ticketPrice = 0.01 ETH`, `maxResalePrice = 0.015 ETH`
  - User list `0.012 ETH` → OK ✅
  - User list `0.5 ETH` → REJECT ❌

**Line 6: Update state**
```solidity
ticketPrices[tokenId] = price;
```
- `ticketPrices`: Mapping lưu giá listing
- `price > 0` = đang bán
- `price = 0` = không bán (default)

---

#### Function: buyListedTicket()

```solidity
function buyListedTicket(uint256 tokenId) public payable {
    uint256 price = ticketPrices[tokenId];
    require(price > 0, "Not for sale");
    require(msg.value >= price, "Insufficient payment");
    
    address seller = ownerOf(tokenId);
    
    // Calculate royalty
    uint256 royaltyAmount = (price * royaltyPercentage) / 10000;
    uint256 sellerAmount = price - royaltyAmount;
    
    // Reset listing
    ticketPrices[tokenId] = 0;
    
    // Transfer payments
    payable(owner()).transfer(royaltyAmount);
    payable(seller).transfer(sellerAmount);
    
    // Transfer NFT
    _transfer(seller, msg.sender, tokenId);
    
    emit TicketSold(tokenId, seller, msg.sender, price);
}
```

**Giải thích chi tiết:**

**Step 1: Validation**
```solidity
require(price > 0, "Not for sale");
```
- `ticketPrices[tokenId] = 0` → Vé không được list
- Ngăn mua vé không tồn tại trong marketplace

**Step 2: Tính toán phân chia tiền**
```solidity
uint256 royaltyAmount = (price * royaltyPercentage) / 10000;
```
- `royaltyPercentage`: Stored in basis points (1% = 100)
- Ví dụ: `royaltyPercentage = 1000` (10%)
  - `price = 0.1 ETH = 100,000,000 gwei`
  - `royaltyAmount = 100,000,000 * 1000 / 10,000 = 10,000,000 gwei = 0.01 ETH`

```solidity
uint256 sellerAmount = price - royaltyAmount;
```
- Số còn lại = tiền người bán nhận
- Ví dụ: `0.1 ETH - 0.01 ETH = 0.09 ETH`

**Step 3: Checks-Effects-Interactions Pattern**

**Effects (thay đổi state TRƯỚC khi transfer):**
```solidity
ticketPrices[tokenId] = 0;
```
- Delist vé ngay lập tức
- **Ngăn reentrancy attack**: Nếu setter là contract ác ý, call lại function này trong `transfer()`, state đã đổi rồi → fail

**Interactions (external calls SAU khi đã đổi state):**
```solidity
payable(owner()).transfer(royaltyAmount);
payable(seller).transfer(sellerAmount);
```
- `owner()`: Organizer (inherited từ Ownable)
- `.transfer()`: Gửi ETH, auto revert nếu fail

```solidity
_transfer(seller, msg.sender, tokenId);
```
- ERC721 function transfer NFT ownership
- `seller` → `msg.sender` (buyer)

**Khi giảng viên hỏi:** "Tại sao chia 10,000?"

**Trả lời:**
> "Em dùng **basis points** - chuẩn trong finance.
> 1 basis point = 0.01%, 10,000 basis points = 100%.
> 
> Ưu điểm:
> - Độ chính xác cao (có thể set 0.5% = 50 basis points)
> - Tránh floating point (Solidity không hỗ trợ decimals)
> - Industry standard
> 
> Ví dụ: Royalty 5% = `royaltyPercentage = 500`"

---

## 🎨 Frontend Hooks

### useEventFactory.ts

**Vai trò:** React hooks để tương tác với EventFactory contract

#### Hook: useCreateEvent()

```typescript
export function useCreateEvent() {
    const { writeContract, isPending, isConfirming, isSuccess } = useWriteContract();
    
    const createEvent = (params: CreateEventParams) => {
        writeContract({
            address: CONTRACTS.EVENT_FACTORY_ADDRESS as `0x${string}`,
            abi: EventFactoryABI,
            functionName: 'createEvent',
            args: [
                params.name,
                params.symbol,
                params.eventName,
                params.eventDate,
                params.eventLocation,
                params.ticketPrice,
                params.maxResalePrice,
                params.royaltyPercentage,
                params.totalTickets
            ]
        });
    };
    
    return { createEvent, isPending, isConfirming, isSuccess };
}
```

**Giải thích:**

**`useWriteContract()` (Wagmi hook):**
- Built-in hook để gọi contract functions ghi data (write)
- Trả về:
  - `writeContract()`: Function để execute transaction
  - `isPending`: User chưa ký trong MetaMask
  - `isConfirming`: Transaction đang được miners confirm
  - `isSuccess`: Transaction thành công

**`args` array:**
- Phải đúng thứ tự với function signature trong Solidity
- TypeScript check type safety

**Usage trong component:**
```typescript
const { createEvent, isSuccess } = useCreateEvent();

const handleSubmit = () => {
    createEvent({
        name: "MyTicket",
        symbol: "MTK",
        eventName: "Concert",
        // ... other params
    });
};

useEffect(() => {
    if (isSuccess) {
        toast.success("Event created!");
    }
}, [isSuccess]);
```

---

#### Hook: useGetAllEvents()

```typescript
export function useGetAllEvents() {
    const { data: eventAddresses, isLoading } = useReadContract({
        address: CONTRACTS.EVENT_FACTORY_ADDRESS as `0x${string}`,
        abi: EventFactoryABI,
        functionName: 'getAllEvents',
    });
    
    return {
        eventAddresses: eventAddresses as string[] | undefined,
        isLoading
    };
}
```

**Giải thích:**

**`useReadContract()` (Wagmi hook):**
- Dùng cho contract calls READ ONLY (không thay đổi state)
- KHÔNG cần ký transaction (miễn phí)
- Auto-refresh khi blockchain state thay đổi

**Return value:**
- `eventAddresses`: Array of contract addresses
- Ví dụ: `["0xAAA...", "0xBBB...", "0xCCC..."]`

**Type casting:**
```typescript
eventAddresses as string[]
```
- Wagmi trả về kiểu `unknown`
- Cast sang `string[]` để TypeScript hiểu

---

### useEventTicket.ts

#### Hook: useMintTicket()

```typescript
export function useMintTicket(eventAddress: string) {
    const { address } = useAccount();
    const { writeContract, isPending, isConfirming, isSuccess } = useWriteContract();
    
    const mintTicket = (tokenURI: string, value: bigint) => {
        if (!address) return;
        
        writeContract({
            address: eventAddress as `0x${string}`,
            abi: EventTicketABI,
            functionName: 'mintTicket',
            args: [address, tokenURI],
            value, // ETH amount to send
        });
    };
    
    return { mintTicket, isPending, isConfirming, isSuccess };
}
```

**Giải thích:**

**`useAccount()`:**
- Wagmi hook lấy user's connected wallet address
- `address`: `0x123...` hoặc `undefined` nếu chưa connect

**`value` parameter:**
```typescript
value: bigint
```
- Số ETH gửi kèm transaction (msg.value)
- Dùng `BigInt` để tránh precision loss
- Ví dụ: `parseEther("0.01")` = `10000000000000000n` wei

**Usage:**
```typescript
const { mintTicket } = useMintTicket(eventAddress);

const handleBuy = () => {
    const price = parseEther("0.01"); // Convert ETH to wei
    mintTicket("ipfs://metadata", price);
};
```

---

#### Hook: useListTicket()

```typescript
export function useListTicket(eventAddress: string) {
    const { writeContract, isPending, isConfirming, isSuccess } = useWriteContract();
    
    const listTicket = ({ tokenId, price }: { tokenId: number; price: bigint }) => {
        writeContract({
            address: eventAddress as `0x${string}`,
            abi: EventTicketABI,
            functionName: 'listTicket',
            args: [BigInt(tokenId), price]
        });
    };
    
    return { listTicket, isPending, isConfirming, isSuccess };
}
```

**Giải thích:**

**BigInt conversion:**
```typescript
args: [BigInt(tokenId), price]
```
- `tokenId`: `number` → `bigint` (Solidity `uint256`)
- `price`: Đã là `bigint` từ `parseEther()`

**Destructuring pattern:**
```typescript
{ tokenId, price }: { tokenId: number; price: bigint }
```
- Nhận object, destructure ra 2 properties
- Type-safe với TypeScript

---

## 🛠️ Utility Functions

### fetchUserTickets.ts

**Vai trò:** Fetch tất cả tickets owned by user cho 1 event

```typescript
export async function fetchUserTickets(
    eventAddress: string, 
    userAddress: string
): Promise<{ tokenId: number; price: bigint }[]> {
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia-rpc.publicnode.com')
    });
    
    // Step 1: Get total minted tickets
    const totalMinted = await publicClient.readContract({
        address: eventAddress as `0x${string}`,
        abi: EventTicketABI,
        functionName: 'totalMinted'
    }) as bigint;
    
    if (totalMinted === BigInt(0)) return [];
    
    // Step 2: Prepare multicall for ownerOf
    const ownerCalls = [];
    for (let i = 0; i < Number(totalMinted); i++) {
        ownerCalls.push({
            address: eventAddress as `0x${string}`,
            abi: EventTicketABI,
            functionName: 'ownerOf',
            args: [BigInt(i)]
        });
    }
    
    // Step 3: Execute multicall
    const ownerResults = await publicClient.multicall({
        contracts: ownerCalls
    });
    
    // Step 4: Filter tickets owned by user
    const userTicketIds = ownerResults
        .map((result, index) => ({
            tokenId: index,
            owner: result.result
        }))
        .filter(ticket => 
            ticket.owner?.toString().toLowerCase() === userAddress.toLowerCase()
        )
        .map(ticket => ticket.tokenId);
    
    if (userTicketIds.length === 0) return [];
    
    // Step 5: Get listing prices for user's tickets
    const priceCalls = userTicketIds.map(tokenId => ({
        address: eventAddress as `0x${string}`,
        abi: EventTicketABI,
        functionName: 'ticketPrices',
        args: [BigInt(tokenId)]
    }));
    
    const priceResults = await publicClient.multicall({
        contracts: priceCalls
    });
    
    // Step 6: Combine data
    return userTicketIds.map((tokenId, index) => ({
        tokenId,
        price: (priceResults[index].result as bigint) || BigInt(0)
    }));
}
```

**Giải thích chi tiết:**

**Step 1: Get totalMinted**
```typescript
const totalMinted = await publicClient.readContract({
    functionName: 'totalMinted'
});
```
- Lấy tổng số vé đã mint
- Ví dụ: Event có 100 vé, đã bán 50 → `totalMinted = 50`
- TokenIDs: `0, 1, 2, ..., 49`

**Step 2-3: Multicall ownerOf**
```typescript
const ownerCalls = [];
for (let i = 0; i < Number(totalMinted); i++) {
    ownerCalls.push({
        functionName: 'ownerOf',
        args: [BigInt(i)]
    });
}

const ownerResults = await publicClient.multicall({ contracts: ownerCalls });
```

**Tại sao dùng multicall?**
- Không multicall: 50 vé = 50 RPC calls riêng lẻ
- Có multicall: 50 vé = 1 RPC call duy nhất
- **Performance boost:** 10-50x faster!

**Cách hoạt động:**
1. Tạo array of calls: `[ownerOf(0), ownerOf(1), ..., ownerOf(49)]`
2. Viem bundle thành 1 transaction STATIC CALL
3. Nhận array results: `[0xAAA, 0xBBB, 0xAAA, ...]`

**Step 4: Filter user's tickets**
```typescript
const userTicketIds = ownerResults
    .map((result, index) => ({ tokenId: index, owner: result.result }))
    .filter(ticket => 
        ticket.owner?.toString().toLowerCase() === userAddress.toLowerCase()
    )
    .map(ticket => ticket.tokenId);
```

**Giải thích:**
- `.map()` 1: Transform array thành objects `{ tokenId, owner }`
- `.filter()`: Chỉ giữ tickets mà `owner === userAddress`
- `.map()` 2: Extract chỉ `tokenId`

**Ví dụ:**
```typescript
// ownerResults = [0xAAA, 0xBBB, 0xAAA, 0xCCC]
// userAddress = 0xAAA

// After filter:
userTicketIds = [0, 2] // User owns ticket #0 và #2
```

**Step 5-6: Get prices via multicall**
- Tương tự như ownerOf
- Query `ticketPrices[tokenId]` cho từng vé user owns
- Return array `[{ tokenId: 0, price: 0n }, { tokenId: 2, price: 12000000000000000n }]`

**Khi giảng viên hỏi:** "Nếu có 10,000 vé thì sao?"

**Trả lời:**
> "Đây là limitation của solution hiện tại. Với 10,000 vé:
> - Multicall vẫn chạy nhưng chậm (vài giây)
> - Có thể timeout nếu network lag
> 
> **Solutions:**
> 1. **Pagination**: Fetch 100 vé một lần, có next/prev buttons
> 2. **The Graph**: Indexer off-chain, query nhanh
> 3. **ERC721Enumerable**: Onchain tracking (trade-off: gas cao hơn khi mint)
> 
> Với scope đồ án và typical event size (< 1000 vé), solution hiện tại OK."

---

### fetchSoldTickets.ts

**Vai trò:** Fetch lịch sử bán vé từ blockchain event logs

```typescript
export async function fetchSoldTickets(
    eventAddresses: string[],
    sellerAddress: string
): Promise<SoldTicket[]> {
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia-rpc.publicnode.com')
    });
    
    const allSoldTickets: SoldTicket[] = [];
    
    for (const eventAddress of eventAddresses) {
        // Get logs for TicketSold event
        const logs = await publicClient.getLogs({
            address: eventAddress as `0x${string}`,
            event: {
                type: 'event',
                name: 'TicketSold',
                inputs: [
                    { type: 'uint256', indexed: true, name: 'tokenId' },
                    { type: 'address', indexed: true, name: 'from' },
                    { type: 'address', indexed: true, name: 'to' },
                    { type: 'uint256', indexed: false, name: 'price' }
                ]
            },
            args: {
                from: sellerAddress as `0x${string}` // Filter by seller
            },
            fromBlock: 'earliest'
        });
        
        // Parse logs
        for (const log of logs) {
            allSoldTickets.push({
                eventAddress,
                tokenId: Number(log.args.tokenId),
                buyer: log.args.to as string,
                price: log.args.price as bigint,
                transactionHash: log.transactionHash
            });
        }
    }
    
    return allSoldTickets;
}
```

**Giải thích:**

**Event Logs trong Ethereum:**
- Smart contracts emit events: `emit TicketSold(...)`
- Events được lưu vào blockchain logs (PERMANENT)
- Frontend query logs để lấy historical data

**`getLogs()` parameters:**

```typescript
event: {
    name: 'TicketSold',
    inputs: [...] // ABI của event
}
```
- Define cấu trúc event cần query
- Must match với event definition trong Solidity

```typescript
args: {
    from: sellerAddress
}
```
- **Indexed filtering**: Chỉ lấy logs mà `from = sellerAddress`
- `indexed` parameters có thể filter, `non-indexed` không thể
- Giảm data trả về (performance)

```typescript
fromBlock: 'earliest'
```
- Query từ block đầu tiên của chain
- Alternative: `fromBlock: 5000000n` (specific block)

**Parse logs:**
```typescript
for (const log of logs) {
    allSoldTickets.push({
        tokenId: Number(log.args.tokenId),
        buyer: log.args.to,
        price: log.args.price,
        transactionHash: log.transactionHash
    });
}
```
- `log.args`: Extracted event parameters
- `log.transactionHash`: Link to Etherscan

**Ví dụ output:**
```typescript
[
    {
        eventAddress: "0xAAA...",
        tokenId: 5,
        buyer: "0xBBB...",
        price: 12000000000000000n, // 0.012 ETH
        transactionHash: "0xTXHASH..."
    }
]
```

**Khi giảng viên hỏi:** "Tại sao không lưu vào database?"

**Trả lời:**
> "Blockchain VỐN ĐÃ LÀ database - immutable và decentralized.
> 
> **Ưu điểm query từ logs:**
> - Không cần backend server
> - Data không bao giờ mất/bị hack
> - Fully trustless (verify được mọi transaction)
> 
> **Trade-off:**
> - Query chậm hơn traditional DB
> - Phụ thuộc RPC endpoint
> 
> **Production:** Dùng The Graph (indexer) để best of both worlds."

---

## 📄 Key Pages

### Events Page (`app/events/page.tsx`)

```typescript
export default function EventsPage() {
    const { eventAddresses, isLoading } = useGetAllEvents();
    
    return (
        <div>
            {isLoading ? (
                <LoadingSkeletons />
            ) : (
                eventAddresses?.map((address, index) => (
                    <EventCard key={address} eventAddress={address} index={index} />
                ))
            )}
        </div>
    );
}
```

**Flow:**
1. `useGetAllEvents()` → Call `EventFactory.getAllEvents()`
2. Nhận array addresses: `["0xAAA", "0xBBB"]`
3. Map qua từng address, render `<EventCard />`
4. Mỗi card fetch riêng event details

---

### EventCard Component

```typescript
function EventCard({ eventAddress }: { eventAddress: string }) {
    const { eventName, eventDate, ticketPrice } = useEventDetails(eventAddress);
    
    return (
        <div className="card">
            <h3>{eventName}</h3>
            <p>Date: {new Date(eventDate * 1000).toLocaleDateString()}</p>
            <p>Price: {formatEther(ticketPrice)} ETH</p>
            <Link href={`/events/${index}`}>View Details</Link>
        </div>
    );
}
```

**Giải thích:**

**`useEventDetails()`:**
```typescript
const { eventName } = useReadContract({
    address: eventAddress,
    functionName: 'eventName'
});
```
- Call contract riêng cho từng event
- Parallel calls (React concurrency)

**Date conversion:**
```typescript
new Date(eventDate * 1000).toLocaleDateString()
```
- `eventDate`: Unix timestamp (seconds)
- `* 1000`: Convert to milliseconds (JavaScript Date)
- `.toLocaleDateString()`: Format "MM/DD/YYYY"

**BigInt formatting:**
```typescript
formatEther(ticketPrice) // Viem helper
```
- Input: `10000000000000000n` (wei)
- Output: `"0.01"` (ETH string)

---

### Marketplace Page (`app/marketplace/page.tsx`)

```typescript
export default function MarketplacePage() {
    const { eventAddresses } = useGetAllEvents();
    const [tickets, setTickets] = useState<ListedTicket[]>([]);
    
    useEffect(() => {
        if (eventAddresses) {
            fetchAllListedTickets(eventAddresses).then(setTickets);
        }
    }, [eventAddresses]);
    
    return (
        <div className="grid">
            {tickets.map(ticket => (
                <MarketplaceTicketCard key={`${ticket.eventAddress}-${ticket.tokenId}`} ticket={ticket} />
            ))}
        </div>
    );
}
```

**Flow:**
1. Get all event addresses
2. `fetchAllListedTickets()` loop qua từng event
3. Multicall `ticketPrices[]` cho tất cả tokenIds
4. Filter `price > 0` (= listed)
5. Render cards

---

### My Tickets Page

```typescript
<div className="grid lg:grid-cols-3">
    {/* Left: Owned Tickets */}
    <div className="lg:col-span-2">
        {eventAddresses.map(address => (
            <TicketCard eventAddress={address} />
        ))}
    </div>
    
    {/* Right: Sales History */}
    <div className="lg:col-span-1">
        <SoldTicketList eventAddresses={eventAddresses} />
    </div>
</div>
```

**2-column layout:**
- **Col 1-2**: Owned tickets (có thể sell/unlist)
- **Col 3**: Sales history sidebar (readonly)

---

## 🎨 UI Components

### SellTicketModal

```typescript
const handleList = () => {
    const priceWei = parseEther(price);
    if (priceWei > maxResalePrice) {
        alert("Price exceeds max");
        return;
    }
    listTicket({ tokenId, price: priceWei });
};
```

**Validation:**
- Parse ETH input → wei
- Check vs `maxResalePrice`
- If OK → Call smart contract

---

## 🔧 Configuration Files

### contracts.ts

```typescript
export const CONTRACTS = {
    EVENT_FACTORY_ADDRESS: '0x33fDde77771520dD11fc11fCcCb60fbdcb731AB3f',
    CHAIN_ID: 11155111, // Sepolia
    RPC_URL: 'https://ethereum-sepolia-rpc.publicnode.com'
};
```

**Cần update khi:**
- Redeploy contracts → Change ADDRESS
- Switch network → Change CHAIN_ID & RPC_URL

---

## 💡 Common Questions & Answers

### Q1: "Phân biệt `write` và `read` contract calls?"

**A:**
- **Read:** Query data, không tốn gas, instant
  - Ví dụ: `ownerOf()`, `eventName`, `ticketPrice`
  - Dùng `useReadContract()`
  
- **Write:** Thay đổi state, tốn gas, cần confirm
  - Ví dụ: `mintTicket()`, `listTicket()`
  - Dùng `useWriteContract()`

---

### Q2: "BigInt là gì? Tại sao không dùng number?"

**A:**
- **BigInt:** JavaScript type cho số rất lớn
- **Vấn đề với number:** Max safe = 2^53 (~ 9 quadrillion)
- **Wei values:** 1 ETH = 10^18 wei = quá lớn cho number
- **Solution:** Dùng `bigint` literal: `10000000000000000n`

**Conversion:**
```typescript
parseEther("0.01")  // string → bigint
formatEther(price)  // bigint → string
```

---

### Q3: "Làm sao biết transaction success?"

**A:**
```typescript
const { writeContract, isSuccess } = useWriteContract();

useEffect(() => {
    if (isSuccess) {
        toast.success("Done!");
        refetchData();
    }
}, [isSuccess]);
```

**States:**
1. `isPending`: Chờ user ký MetaMask
2. `isConfirming`: Đang chờ miners
3. `isSuccess`: ✅ Confirmed on-chain
4. `isError`: ❌ Failed

---

### Q4: "Auto-refresh sau transaction như thế nào?"

**A:**
```typescript
useEffect(() => {
    if (isSuccess) {
        setTimeout(() => {
            fetchTickets(); // Re-fetch data
        }, 2000); // Wait 2s for blockchain to update
    }
}, [isSuccess]);
```

**Tại sao delay 2s?**
- Transaction confirmed ≠ RPC node updated
- Nodes cần sync state
- 2s = safe buffer

---

## 🎓 Tips Trả Lời Giảng Viên

### ✅ DO:
1. **Giải thích bằng ví dụ cụ thể**
   - "Ví dụ vé giá 0.01 ETH..."
   
2. **Nhắc OpenZeppelin khi có thể**
   - "Em dùng OpenZeppelin ERC721 đã được audit..."
   
3. **Highlight security**
   - "Em dùng require để validate..."
   
4. **Honest về trade-offs**
   - "Em biết có cách X tốt hơn nhưng chọn Y vì..."

### ❌ DON'T:
1. Nói "Em không biết" ngay
   - → Explain logic, admit nếu thực sự không biết
   
2. Dùng thuật ngữ không giải thích
   - → Define rồi mới dùng
   
3. Criticize design choices
   - → Explain rationale

---

**Bạn đã sẵn sàng! 💪**
