// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventTicket.sol";

/**
 * @title EventFactory
 * @dev Factory contract to create and manage multiple event ticket contracts
 */
contract EventFactory {
    // Array to store all created events
    address[] public events;
    
    // Mapping from organizer to their events
    mapping(address => address[]) public organizerEvents;
    
    // Event emitted when new event is created
    event EventCreated(
        address indexed eventAddress,
        address indexed organizer,
        string eventName,
        uint256 ticketPrice,
        uint256 totalTickets
    );
    
    /**
     * @dev Create a new event ticket contract
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
        // Create new EventTicket contract
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
        
        address eventAddress = address(newEvent);
        
        // Store event address
        events.push(eventAddress);
        organizerEvents[msg.sender].push(eventAddress);
        
        // Transfer ownership to organizer
        newEvent.transferOwnership(msg.sender);
        
        emit EventCreated(
            eventAddress,
            msg.sender,
            eventName,
            ticketPrice,
            totalTickets
        );
        
        return eventAddress;
    }
    
    /**
     * @dev Get all events
     */
    function getAllEvents() public view returns (address[] memory) {
        return events;
    }
    
    /**
     * @dev Get events created by specific organizer
     */
    function getOrganizerEvents(address organizer) public view returns (address[] memory) {
        return organizerEvents[organizer];
    }
    
    /**
     * @dev Get total number of events
     */
    function getTotalEvents() public view returns (uint256) {
        return events.length;
    }
}
