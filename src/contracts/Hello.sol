pragma solidity ^0.5.0; // Specify the version

// Enable experimental ABI encoder to support dynamic arrays
pragma experimental ABIEncoderV2;

contract Hello {
    // Store messages for each recipient
    mapping(address => string[]) private messages;

    event MessageSent(address indexed recipient, string message);

    // Function to send a message
    function sendMessage(address recipient, string memory message) public {
        require(recipient != address(0), "Invalid recipient address");
        messages[recipient].push(message); // Store the message for the recipient
        emit MessageSent(recipient, message);
    }

    // Function to get all messages for a recipient
    function getMessages(address recipient) public view returns (string[] memory) {
        return messages[recipient]; // Retrieve all messages for the recipient
    }
}
