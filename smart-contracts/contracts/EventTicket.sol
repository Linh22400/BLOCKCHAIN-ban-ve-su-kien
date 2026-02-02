// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ═══════════════════════════════════════════════════════════════════
 * CONTRACT: EventTicket
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Mục đích: NFT contract quản lý vé cho 1 event cụ thể
 * 
 * Kế thừa từ:
 * - ERC721URIStorage: Standard NFT với metadata URI
 * - Ownable: Access control cho organizer
 * 
 * Chức năng chính:
 * 1. Mint vé NFT khi user mua (Primary Sale)
 * 2. List/Unlist vé để bán lại (Secondary Market)
 * 3. Buy vé từ người khác với royalty cho organizer
 * 4. Check-in vé tại sự kiện
 * 5. Ngăn chặn scalping: giá bán lại không vượt quá maxResalePrice
 * 
 * Security Features:
 * - Price ceiling: Không cho bán quá giá
 * - Royalty system: Organizer luôn nhận % từ resale
 * - Check-in once: Vé đã dùng không thể dùng lại
 * - Owner control: Chỉ organizer mới check-in được
 */
contract EventTicket is ERC721URIStorage, Ownable {
    
    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES - Event Information
    // ═══════════════════════════════════════════════════════════════
    
    /// @notice Tên sự kiện (vd: "Sơn Tùng MTP Concert")
    string public eventName;
    
    /// @notice Thời gian event (Unix timestamp)
    uint256 public eventDate;
    
    /// @notice Địa điểm tổ chức (vd: "Mỹ Đình Stadium")
    string public eventLocation;
    
    /// @notice Giá vé gốc khi mua từ organizer (wei)
    uint256 public ticketPrice;
    
    /// @notice Giá tối đa khi bán lại - chống scalping (wei)
    uint256 public maxResalePrice;
    
    /// @notice % hoa hồng cho organizer khi vé bán lại
    /// @dev Tính theo basis points (500 = 5%, 1000 = 10%)
    uint256 public royaltyPercentage;
    
    /// @notice Tổng số vé cho event này
    uint256 public totalTickets;
    
    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES - Ticket Tracking
    // ═══════════════════════════════════════════════════════════════
    
    /// @dev Counter để generate tokenId (0, 1, 2, ...)
    /// @dev Private vì chỉ dùng internal
    uint256 private _tokenIdCounter;
    
    /// @notice Mapping: tokenId => đã check-in chưa
    /// @dev true = đã sử dụng, không thể vào event lần 2
    mapping(uint256 => bool) public ticketUsed;
    
    /// @notice Mapping: tokenId => giá gốc khi mint
    /// @dev Lưu để tracking, không dùng trong logic
    mapping(uint256 => uint256) public ticketOriginalPrice;
    
    /// @notice Mapping: tokenId => giá đang bán (0 = không bán)
    /// @dev Secondary marketplace pricing
    mapping(uint256 => uint256) public ticketPrices;
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    /// @notice Emit khi mint vé mới (primary sale)
    event TicketMinted(address indexed buyer, uint256 indexed tokenId);
    
    /// @notice Emit khi vé được check-in tại event
    event TicketUsed(uint256 indexed tokenId);
    
    /// @notice Emit khi vé được list lên marketplace
    event TicketListed(uint256 indexed tokenId, uint256 price);
    
    /// @notice Emit khi vé bị unlist khỏi marketplace
    event TicketUnlisted(uint256 indexed tokenId);
    
    /// @notice Emit khi vé được bán trên secondary market
    event TicketSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    
    /// @notice Emit khi vé được resold (legacy, tương tự TicketSold)
    event TicketResold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    
    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Khởi tạo contract cho 1 event
     * @dev Được gọi bởi EventFactory khi tạo event mới
     * 
     * @param _name Tên NFT collection
     * @param _symbol Symbol NFT
     * @param _eventName Tên sự kiện
     * @param _eventDate Timestamp của event
     * @param _eventLocation Địa điểm
     * @param _ticketPrice Giá vé gốc (wei)
     * @param _maxResalePrice Giá tối đa khi resale (wei)
     * @param _royaltyPercentage % hoa hồng (basis points)
     * @param _totalTickets Số lượng vé
     */
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
    
    // ═══════════════════════════════════════════════════════════════
    // MAIN FUNCTIONS - Primary Sale
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Mua vé mới từ organizer (primary sale)
     * @dev Payable function - user phải gửi ETH kèm theo
     * 
     * Flow:
     * 1. Check còn vé không
     * 2. Check thanh toán đủ không
     * 3. Mint NFT cho buyer
     * 4. Set tokenURI (metadata)
     * 5. Refund nếu trả thừa tiền
     * 6. Emit event
     * 
     * @param to Địa chỉ nhận vé (thường là msg.sender)
     * @param tokenURI Link metadata của vé (IPFS, HTTP, etc.)
     */
    function mintTicket(address to, string memory tokenURI) public payable {
        // Check 1: Còn vé không?
        require(_tokenIdCounter < totalTickets, "All tickets sold");
        
        // Check 2: Trả đủ tiền không?
        require(msg.value >= ticketPrice, "Insufficient payment");
        
        // Lấy tokenId hiện tại và tăng counter
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint NFT cho buyer
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Lưu giá gốc (để tracking)
        ticketOriginalPrice[tokenId] = ticketPrice;
        
        // Refund số tiền thừa (nếu có)
        if (msg.value > ticketPrice) {
            payable(msg.sender).transfer(msg.value - ticketPrice);
        }
        
        emit TicketMinted(to, tokenId);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // MARKETPLACE FUNCTIONS - Secondary Sale
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice List vé lên marketplace để bán
     * @dev Chỉ owner của vé mới list được
     * 
     * Anti-scalping:
     * - Giá không được vượt quá maxResalePrice
     * - Vé đã sử dụng không bán được
     * 
     * @param tokenId ID của vé muốn bán
     * @param price Giá bán (wei)
     */
    function listTicket(uint256 tokenId, uint256 price) public {
        // Check owner
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        
        // Check vé chưa sử dụng
        require(!ticketUsed[tokenId], "Ticket already used");
        
        // Check giá hợp lệ
        require(price > 0, "Price must be greater than 0");
        
        // Check không vượt giá ceiling (chống scalping)
        require(price <= maxResalePrice, "Price exceeds ceiling");

        // Set giá bán (> 0 = đang list)
        ticketPrices[tokenId] = price;
        
        emit TicketListed(tokenId, price);
    }

    /**
     * @notice Gỡ vé khỏi marketplace
     * @dev Set price = 0 để đánh dấu không bán nữa
     * 
     * @param tokenId ID của vé muốn gỡ
     */
    function unlistTicket(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        
        // Set price = 0 → không bán
        ticketPrices[tokenId] = 0;
        
        emit TicketUnlisted(tokenId);
    }

    /**
     * @notice Mua vé từ marketplace (secondary sale)
     * @dev Payable function - buyer gửi tiền
     * 
     * Flow:
     * 1. Check vé có đang bán không
     * 2. Check thanh toán đủ không
     * 3. Tính royalty cho organizer
     * 4. Chuyển royalty cho organizer
     * 5. Chuyển phần còn lại cho seller
     * 6. Refund nếu trả thừa
     * 7. Transfer NFT từ seller sang buyer
     * 
     * Math:
     * - Total Price = 1 ETH
     * - Royalty (5%) = 0.05 ETH → organizer
     * - Seller Amount = 0.95 ETH → seller
     * 
     * @param tokenId ID của vé muốn mua
     */
    function buyListedTicket(uint256 tokenId) public payable {
        uint256 price = ticketPrices[tokenId];
        
        // Check 1: Vé có đang bán không?
        require(price > 0, "Ticket not listed");
        
        // Check 2: Trả đủ tiền không?
        require(msg.value >= price, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        
        // Check 3: Không tự mua vé của mình
        require(seller != msg.sender, "Cannot buy your own ticket");

        // Tính toán phân chia tiền
        // Royalty = price * royaltyPercentage / 10000
        // Vd: 1 ETH * 500 / 10000 = 0.05 ETH (5%)
        uint256 royalty = (price * royaltyPercentage) / 10000;
        uint256 sellerAmount = price - royalty;

        // Clear listing (không bán nữa)
        ticketPrices[tokenId] = 0;

        // Chuyển tiền royalty cho organizer (owner của contract)
        payable(owner()).transfer(royalty);

        // Chuyển tiền cho seller
        payable(seller).transfer(sellerAmount);

        // Refund số tiền thừa (nếu có)
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        // Transfer NFT ownership
        _transfer(seller, msg.sender, tokenId);

        emit TicketSold(tokenId, seller, msg.sender, price);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // CHECK-IN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Điểm danh vé tại sự kiện
     * @dev Chỉ organizer (owner) mới gọi được
     * 
     * Security:
     * - onlyOwner modifier → chỉ organizer
     * - Vé đã dùng không thể dùng lại
     * 
     * @param tokenId ID của vé cần check-in
     */
    function markTicketUsed(uint256 tokenId) public onlyOwner {
        require(!ticketUsed[tokenId], "Ticket already used");
        
        // Đánh dấu vé đã sử dụng
        ticketUsed[tokenId] = true;
        
        emit TicketUsed(tokenId);
    }
    
    /**
     * @notice Kiểm tra vé có hợp lệ để vào event không
     * @dev View function - không tốn gas
     * 
     * Vé hợp lệ khi:
     * 1. User là owner của vé
     * 2. Vé chưa được sử dụng
     * 
     * @param tokenId ID vé cần kiểm tra
     * @param user Địa chỉ người giữ vé
     * @return bool true = hợp lệ, false = không hợp lệ
     */
    function isTicketValid(uint256 tokenId, address user) public view returns (bool) {
        return ownerOf(tokenId) == user && !ticketUsed[tokenId];
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Rút toàn bộ tiền trong contract
     * @dev Chỉ organizer (owner) mới rút được
     * 
     * Tiền trong contract từ đâu?
     * - Primary sales (mintTicket)
     * - Royalties từ secondary sales
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Lấy tổng số vé đã bán
     * @dev Return giá trị của _tokenIdCounter
     * @return uint256 Số vé đã mint
     */
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
