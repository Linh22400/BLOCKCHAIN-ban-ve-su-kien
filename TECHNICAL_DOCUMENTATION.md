# Technical Documentation - NFT Ticketing Platform

## 📐 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (User)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MetaMask   │  │  Next.js UI  │  │  React State │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │ Sign Tx          │ HTTP              │
          ↓                  ↓                   ↓
┌─────────────────────────────────────────────────────────────┐
│                     Blockchain Layer                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Sepolia Testnet (Ethereum L2)            │     │
│  │  ┌──────────────────┐    ┌──────────────────┐     │     │
│  │  │ EventFactory.sol │───→│ EventTicket.sol  │     │     │
│  │  │  0x33fD...AB3f   │    │ (Multiple Instances)  │     │
│  │  └──────────────────┘    └──────────────────┘     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
          ↓                                    ↑
    Write (Tx)                           Read (RPC)
          ↓                                    ↑
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Wagmi Hooks │→ │ Viem Client  │→ │ publicnode   │       │
│  │             │  │ (TypeScript) │  │ RPC endpoint │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Smart Contract Architecture

### Contract Hierarchy

```
┌──────────────────────────────────────┐
│        EventFactory.sol              │
│  - Factory pattern implementation    │
│  - Deploys EventTicket contracts     │
│  - Tracks all events globally        │
└────────────┬─────────────────────────┘
             │ createEvent()
             │
             ↓ (deploys new instance)
┌──────────────────────────────────────┐
│       EventTicket.sol (Instance)     │
│  - ERC-721 NFT implementation        │
│  - Event-specific logic              │
│  - Marketplace functions             │
│  - Check-in system                   │
└──────────────────────────────────────┘
```

### Inheritance Structure

```
EventTicket.sol
    ├── ERC721URIStorage (OpenZeppelin)
    │   └── ERC721 (Base NFT implementation)
    │       └── IERC721
    │
    └── Ownable (OpenZeppelin)
        └── Access control for admin functions
```

---

## 💾 Data Models

### EventFactory Storage

```solidity
// State Variables
address[] public events;                          // All deployed EventTicket addresses
mapping(address => address[]) public organizerEvents; // Organizer → their events
```

### EventTicket Storage

```solidity
// Event Metadata
string public eventName;
uint256 public eventDate;          // Unix timestamp
string public eventLocation;
uint256 public ticketPrice;         // Wei (primary sale)
uint256 public maxResalePrice;      // Wei (ceiling for resale)
uint256 public royaltyPercentage;   // Basis points (e.g., 500 = 5%)
uint256 public totalTickets;        // Max supply

// Ticket State
uint256 private _tokenIdCounter;    // Auto-increment ID
mapping(uint256 => bool) public ticketUsed;           // Check-in status
mapping(uint256 => uint256) public ticketOriginalPrice; // Original mint price
mapping(uint256 => uint256) public ticketPrices;       // Current listing price (0 = not listed)

// ERC-721 Inherited
mapping(uint256 => address) private _owners;           // TokenID → Owner
mapping(address => uint256) private _balances;         // Owner → Token count
```

---

## 🔄 Transaction Flows

### Flow 1: Create Event

```
User (Organizer)
    ↓ Click "Create Event"
Frontend Form
    ↓ Validate inputs
    ↓ Convert ETH → Wei, Date → Unix timestamp
Wagmi Hook: useCreateEvent()
    ↓ Call EventFactory.createEvent()
    ↓ Send transaction to MetaMask
MetaMask
    ↓ User signs transaction
    ↓ Broadcast to Sepolia
Sepolia Network
    ↓ Miner includes tx in block
EventFactory.createEvent()
    ↓ Deploy new EventTicket contract
    ↓ Store contract address in events[]
    ↓ Emit EventCreated event
    ↓ Return new contract address
Frontend
    ↓ Listen for transaction confirmation
    ↓ Show success toast
    ↓ Redirect to /events
```

### Flow 2: Buy Ticket (Primary Sale)

```
User (Buyer)
    ↓ Click "Buy Ticket" on event details
Frontend
    ↓ Check wallet connected
    ↓ Validate ticket availability
Wagmi Hook: useMintTicket()
    ↓ Call EventTicket.mintTicket(address, tokenURI)
    ↓ Attach payment: msg.value = ticketPrice
MetaMask
    ↓ User confirms payment + gas
EventTicket.mintTicket()
    ↓ require(msg.value >= ticketPrice)
    ↓ require(_tokenIdCounter < totalTickets)
    ↓ _safeMint(to, tokenId)
    ↓ _setTokenURI(tokenId, tokenURI)
    ↓ Increment _tokenIdCounter
    ↓ Emit TicketMinted event
Frontend
    ↓ Wait for confirmation
    ↓ Show success toast
    ↓ Refresh event details (decrement available tickets)
```

### Flow 3: List Ticket for Resale

```
User (Seller)
    ↓ Navigate to My Tickets
    ↓ Click "Sell" on owned ticket
SellTicketModal
    ↓ Input price in ETH
    ↓ Validate: price <= maxResalePrice
Wagmi Hook: useListTicket()
    ↓ Call EventTicket.listTicket(tokenId, priceWei)
EventTicket.listTicket()
    ↓ require(ownerOf(tokenId) == msg.sender)
    ↓ require(price <= maxResalePrice)
    ↓ ticketPrices[tokenId] = price
    ↓ Emit TicketListed event
Frontend
    ↓ Close modal
    ↓ Show success toast
    ↓ Refresh ticket list (button: Sell → Unlist)
    ↓ Ticket appears in Marketplace
```

### Flow 4: Buy from Marketplace

```
User (Buyer)
    ↓ Browse Marketplace
    ↓ Click "Buy Ticket" on listed ticket
Wagmi Hook: useBuyListedTicket()
    ↓ Call EventTicket.buyListedTicket(tokenId)
    ↓ Attach payment: msg.value = ticketPrices[tokenId]
EventTicket.buyListedTicket()
    ↓ require(ticketPrices[tokenId] > 0)  // Is listed?
    ↓ require(msg.value >= listedPrice)
    ↓ Calculate royalty: royaltyAmount = price * royaltyPercentage / 10000
    ↓ Transfer funds:
    │   - Owner receives: price - royaltyAmount
    │   - Event organizer receives: royaltyAmount
    ↓ _transfer(currentOwner, msg.sender, tokenId)
    ↓ ticketPrices[tokenId] = 0  // Delist
    ↓ Emit TicketSold event
Frontend
    ↓ Show success toast
    ↓ Remove ticket from marketplace list
    ↓ Add to buyer's "My Tickets"
    ↓ Add to seller's "Sales History"
```

---

## 🔒 Security Measures

### 1. Access Control
```solidity
// Only organizer can mark tickets as used
modifier onlyOwner() {
    require(msg.sender == owner(), "Not authorized");
    _;
}

function markTicketUsed(uint256 tokenId) public onlyOwner { }
```

### 2. Reentrancy Protection
```solidity
// Checks-Effects-Interactions pattern
function buyListedTicket(uint256 tokenId) public payable {
    // 1. Checks
    require(ticketPrices[tokenId] > 0, "Not listed");
    
    // 2. Effects (state changes)
    ticketPrices[tokenId] = 0;
    
    // 3. Interactions (external calls)
    payable(seller).transfer(sellerAmount);
    _transfer(seller, buyer, tokenId);
}
```

### 3. Input Validation
```solidity
function listTicket(uint256 tokenId, uint256 price) public {
    require(ownerOf(tokenId) == msg.sender, "Not owner");
    require(!ticketUsed[tokenId], "Already used");
    require(price <= maxResalePrice, "Price too high");
    require(price > 0, "Invalid price");
    // ...
}
```

### 4. Anti-Scalping Enforcement
```solidity
uint256 public maxResalePrice;  // Set at deployment

// Hard ceiling on resale price
require(price <= maxResalePrice, "Exceeds max resale price");
```

### 5. Safe Math (Built-in Solidity 0.8+)
- Automatic overflow/underflow checks
- No need for SafeMath library

---

## 🌐 Frontend Architecture

### Component Structure

```
app/
├── layout.tsx              # Root layout (Wallet provider, Toaster)
├── page.tsx                # Homepage
├── events/
│   ├── page.tsx            # Events list (fetch all events)
│   └── [id]/page.tsx       # Event details + Buy button
├── marketplace/
│   └── page.tsx            # Aggregated listings across all events
├── my-tickets/
│   └── page.tsx            # User's NFTs + Sales history
└── admin/
    ├── create/page.tsx     # Deploy new event
    ├── dashboard/page.tsx  # Organizer's events
    └── checkin/[id]/page.tsx  # Mark tickets as used

components/
├── layout/
│   ├── Navbar.tsx          # Navigation + Wallet button
│   └── Footer.tsx
├── marketplace/
│   └── SellTicketModal.tsx # List ticket for sale
└── ui/                     # Shadcn UI components

hooks/
├── useEventFactory.ts      # EventFactory interactions
└── useEventTicket.ts       # EventTicket interactions

utils/
├── fetchUserTickets.ts     # Multicall for ownership
├── fetchListedTickets.ts   # Aggregate marketplace data
└── fetchSoldTickets.ts     # Event logs for sales history
```

### State Management

**React Hooks + Wagmi:**
- No Redux/Zustand needed
- Wagmi handles contract state caching
- React hooks for local UI state

**Example Hook:**
```typescript
export function useMintTicket(eventAddress: string) {
    const { writeContract, isPending, isSuccess } = useWriteContract();
    
    const mintTicket = (tokenURI: string, value: bigint) => {
        writeContract({
            address: eventAddress as `0x${string}`,
            abi: EventTicketABI,
            functionName: 'mintTicket',
            args: [address, tokenURI],
            value,
        });
    };
    
    return { mintTicket, isPending, isSuccess };
}
```

---

## 📡 RPC Interaction Optimization

### Multicall Strategy

**Problem:** Fetching 100 tickets = 100 RPC calls = slow

**Solution:** Viem multicall
```typescript
const calls = tickets.map(i => ({
    address: eventAddress,
    abi: ABI,
    functionName: 'ownerOf',
    args: [BigInt(i)]
}));

const results = await publicClient.multicall({ contracts: calls });
// 100 tickets → 1 RPC call!
```

**Used in:**
- `fetchUserTickets()` - Check ownership of all tickets
- `fetchListedTickets()` - Get listing prices

---

## 🎨 UX Design Patterns

### 1. Optimistic Updates
```typescript
// Show loading immediately
setLoading(true);

// Call contract
await mintTicket();

// Update UI after confirmation
setLoading(false);
toast.success("Ticket purchased!");
```

### 2. Transaction Status Tracking
```typescript
const { isPending, isConfirming, isSuccess } = useWriteContract();

// UI states:
// isPending → "Waiting for signature..."
// isConfirming → "Confirming on blockchain..."
// isSuccess → "Success! ✅"
```

### 3. Auto-Refresh Data
```typescript
useEffect(() => {
    if (isSuccess) {
        // Refetch after 2s to allow blockchain to update
        setTimeout(() => {
            fetchTickets();
        }, 2000);
    }
}, [isSuccess]);
```

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**Smart Contracts:**
- [x] Deploy EventFactory
- [x] Create event via factory
- [x] Mint ticket (primary sale)
- [x] List ticket for resale
- [x] Buy listed ticket (verify royalty distribution)
- [x] Mark ticket as used
- [x] Validate ownership checks

**Frontend:**
- [x] Wallet connection (RainbowKit)
- [x] Create event form submission
- [x] Buy ticket with MetaMask
- [x] View owned tickets
- [x] List/Unlist ticket
- [x] Buy from marketplace
- [x] Check-in system

**Edge Cases:**
- [x] Cannot list above maxResalePrice
- [x] Cannot mark others' tickets as used
- [x] Cannot buy own listing
- [x] Cannot double-use ticket

---

## 📊 Gas Optimization Techniques

### 1. Storage Packing
```solidity
// Pack variables into single slot
uint256 public ticketPrice;       // 32 bytes
uint256 public maxResalePrice;    // 32 bytes
// → 2 slots = 40,000 gas for SSTORE
```

### 2. Minimal Storage
```solidity
// Don't store if computable
// ❌ Bad: string[] public ticketOwners;
// ✅ Good: Use _owners mapping (ERC721 inherited)
```

### 3. Batch Operations (Future)
```solidity
// Mint multiple tickets in one transaction
function batchMint(address[] calldata recipients) external {
    for (uint i = 0; i < recipients.length; i++) {
        _mint(recipients[i], _tokenIdCounter++);
    }
}
```

---

## 🔮 Scalability Considerations

### Current Limits:
- **Events per organizer:** Unlimited (array in mapping)
- **Tickets per event:** `totalTickets` parameter (no hard limit)
- **Marketplace listings:** Unlimited (event logs)

### Potential Bottlenecks:
1. **Frontend ticket fetching:** O(n) multicall for n tickets
   - **Mitigation:** Pagination, lazy loading
2. **Event log parsing:** Slow for 10,000+ sales
   - **Mitigation:** The Graph indexer (future)

---

## 🚀 Deployment Checklist

- [x] Smart contracts compiled
- [x] Deployed to Sepolia testnet
- [x] Contract address configured in frontend
- [x] ABIs synced to frontend
- [x] RPC endpoint configured (publicnode.com)
- [x] Frontend running on localhost:3000
- [ ] Contract verified on Etherscan (optional)
- [ ] Frontend deployed to Vercel (optional)

---

## 📚 External Dependencies

### Smart Contracts
- OpenZeppelin Contracts 5.1.0
  - `ERC721URIStorage.sol`
  - `Ownable.sol`

### Frontend
- Next.js 16.0.7
- Wagmi 2.19.5
- Viem 2.41.2
- RainbowKit 2.2.9
- TailwindCSS 4.0

---

## 🔧 Environment Variables

### Smart Contracts (.env)
```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=<your-private-key>
ETHERSCAN_API_KEY=<optional-for-verification>
```

### Frontend
```typescript
// contracts.ts
export const NETWORK_CONFIG = {
    chainId: 11155111,  // Sepolia
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
};
```

---

## 🎯 Performance Metrics

**Contract Deployment Gas Costs (Sepolia):**
- EventFactory: ~2,000,000 gas
- EventTicket: ~3,500,000 gas per event

**Transaction Gas Costs:**
- Create Event: ~3.5M gas
- Mint Ticket: ~150k gas
- List Ticket: ~50k gas
- Buy Listed Ticket: ~120k gas (incl. transfer + royalty)
- Check-in: ~30k gas

**Frontend Load Times:**
- Initial page load: < 2s
- Events list fetch: < 1s (5 events)
- My Tickets load: < 2s (multicall for 20 tickets)

---

## 📖 Further Reading

- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Hardhat Guides](https://hardhat.org/docs)
