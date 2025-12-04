// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventTicket
 * @dev NFT contract for event tickets with price ceiling and royalty support
 */
contract EventTicket is ERC721URIStorage, Ownable {
    // Event information
    string public eventName;
    uint256 public eventDate;
    string public eventLocation;
    uint256 public ticketPrice;
    uint256 public maxResalePrice;
    uint256 public royaltyPercentage; // Percentage in basis points (e.g., 500 = 5%)
    uint256 public totalTickets;
    
    // Ticket tracking
    uint256 private _tokenIdCounter;
    mapping(uint256 => bool) public ticketUsed;
    mapping(uint256 => uint256) public ticketOriginalPrice;
    
    // Events
    event TicketMinted(address indexed buyer, uint256 indexed tokenId);
    event TicketUsed(uint256 indexed tokenId);
    event TicketResold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price);
    
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
    
    /**
     * @dev Mint a new ticket
     */
    function mintTicket(address to, string memory tokenURI) public payable {
        require(_tokenIdCounter < totalTickets, "All tickets sold");
        require(msg.value >= ticketPrice, "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        ticketOriginalPrice[tokenId] = ticketPrice;
        
        // Refund excess payment
        if (msg.value > ticketPrice) {
            payable(msg.sender).transfer(msg.value - ticketPrice);
        }
        
        emit TicketMinted(to, tokenId);
    }
    
    /**
     * @dev Transfer ticket with price ceiling and royalty enforcement
     */
    function resellTicket(uint256 tokenId, address to) public payable {
        require(ownerOf(tokenId) == msg.sender, "Not ticket owner");
        require(!ticketUsed[tokenId], "Ticket already used");
        require(msg.value <= maxResalePrice, "Price exceeds ceiling");
        
        // Calculate royalty
        uint256 royalty = (msg.value * royaltyPercentage) / 10000;
        uint256 sellerAmount = msg.value - royalty;
        
        // Transfer royalty to organizer (contract owner)
        payable(owner()).transfer(royalty);
        
        // Transfer payment to seller
        payable(msg.sender).transfer(sellerAmount);
        
        // Transfer NFT
        _transfer(msg.sender, to, tokenId);
        
        emit TicketResold(tokenId, msg.sender, to, msg.value);
    }
    
    /**
     * @dev Mark ticket as used (check-in)
     */
    function markTicketUsed(uint256 tokenId) public onlyOwner {
        require(!ticketUsed[tokenId], "Ticket already used");
        ticketUsed[tokenId] = true;
        emit TicketUsed(tokenId);
    }
    
    /**
     * @dev Check if ticket is valid for entry
     */
    function isTicketValid(uint256 tokenId, address user) public view returns (bool) {
        return ownerOf(tokenId) == user && !ticketUsed[tokenId];
    }
    
    /**
     * @dev Withdraw contract balance (organizer)
     */
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Get total minted tickets
     */
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
