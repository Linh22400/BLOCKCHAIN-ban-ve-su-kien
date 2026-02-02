// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

/**
 * ═══════════════════════════════════════════════════════════════════
 * CONTRACT: EventFactory
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Mục đích: Factory contract để tạo và quản lý nhiều event contracts
 * 
 * Chức năng chính:
 * 1. Tạo event mới (deploy EventTicket contract)
 * 2. Lưu trữ danh sách tất cả events
 * 3. Track events theo từng organizer
 * 4. Cung cấp functions để query events
 * 
 * Pattern: Factory Pattern
 * - 1 EventFactory có thể tạo nhiều EventTicket contracts
 * - Mỗi EventTicket là 1 event riêng biệt với NFT tickets riêng
 * 
 * Security:
 * - Ai cũng có thể tạo event (không giới hạn)
 * - Ownership của event được transfer cho người tạo
 */
contract EventFactory {
    
    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════
    
    /// @notice Mảng lưu địa chỉ tất cả events đã tạo
    /// @dev Public array, auto-generate getter function
    address[] public events;
    
    /// @notice Mapping: organizer address => danh sách event addresses của họ
    /// @dev Dùng để query "events của tôi" nhanh
    mapping(address => address[]) public organizerEvents;
    
    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════
    
    /// @notice Event được emit khi có event mới được tạo
    /// @param eventAddress Địa chỉ contract EventTicket mới
    /// @param organizer Địa chỉ người tạo event
    /// @param eventName Tên sự kiện
    /// @param ticketPrice Giá vé (wei)
    /// @param totalTickets Tổng số vé
    event EventCreated(
        address indexed eventAddress,
        address indexed organizer,
        string eventName,
        uint256 ticketPrice,
        uint256 totalTickets
    );
    
    // ═══════════════════════════════════════════════════════════════
    // MAIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Tạo một event mới (deploy EventTicket contract)
     * @dev Ai cũng có thể gọi function này để tạo event
     * 
     * Flow:
     * 1. Deploy contract EventTicket mới với parameters
     * 2. Lưu địa chỉ contract vào events array
     * 3. Lưu vào mapping organizerEvents
     * 4. Transfer ownership cho msg.sender
     * 5. Emit EventCreated event
     * 
     * @param name Tên NFT collection (vd: "Concert Tickets")
     * @param symbol Symbol NFT (vd: "CONCERT")
     * @param eventName Tên sự kiện (vd: "Sơn Tùng MTP Concert")
     * @param eventDate Thời gian event (Unix timestamp)
     * @param eventLocation Địa điểm (vd: "Mỹ Đình Stadium")
     * @param ticketPrice Giá vé gốc (wei)
     * @param maxResalePrice Giá tối đa khi bán lại (wei)
     * @param royaltyPercentage % hoa hồng cho organizer (0-100)
     * @param totalTickets Tổng số vé available
     * 
     * @return address Địa chỉ EventTicket contract vừa tạo
     */
    function createEvent(
        string memory name,
        string memory symbol,
        string memory eventName,
        uint256 eventDate,
        string memory eventLocation,
        uint256 ticketPrice,
        uint256 maxResalePrice,
        uint256 royaltyPercentage,
        uint256 totalTickets
    ) public returns (address) {
        
        // Bước 1: Deploy contract EventTicket mới
        // 'new' keyword sẽ deploy contract lên blockchain
        EventTicket newEvent = new EventTicket(
            name,
            symbol,
            eventName,
            eventDate,
            eventLocation,
            ticketPrice,
            maxResalePrice,
            royaltyPercentage,
            totalTickets
        );
        
        // Bước 2: Lấy address của contract vừa deploy
        address eventAddress = address(newEvent);
        
        // Bước 3: Lưu vào storage
        events.push(eventAddress);                      // Thêm vào mảng tất cả events
        organizerEvents[msg.sender].push(eventAddress); // Thêm vào events của organizer
        
        // Bước 4: Transfer ownership cho người tạo
        // Sau này chỉ organizer mới có thể check-in vé, withdraw tiền, etc.
        newEvent.transferOwnership(msg.sender);
        
        // Bước 5: Emit event để frontend/indexer có thể track
        emit EventCreated(
            eventAddress,
            msg.sender,
            eventName,
            ticketPrice,
            totalTickets
        );
        
        return eventAddress;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (Read-only, không tốn gas)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * @notice Lấy tất cả events đã được tạo
     * @dev View function, không tốn gas
     * @return address[] Mảng addresses của tất cả EventTicket contracts
     */
    function getAllEvents() public view returns (address[] memory) {
        return events;
    }
    
    /**
     * @notice Lấy tất cả events của một organizer cụ thể
     * @dev View function, dùng để hiển thị "Events của tôi"
     * @param organizer Địa chỉ organizer
     * @return address[] Mảng addresses của events do organizer này tạo
     */
    function getOrganizerEvents(address organizer) public view returns (address[] memory) {
        return organizerEvents[organizer];
    }
    
    /**
     * @notice Lấy tổng số events đã tạo
     * @dev View function, return length của events array
     * @return uint256 Số lượng events
     */
    function getTotalEvents() public view returns (uint256) {
        return events.length;
    }
}
