import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import HelloWorldContract from '../abis/Hello.json';

const App = () => {
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [fetchedMessages, setFetchedMessages] = useState([]); // To hold all messages for the recipient
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [error, setError] = useState('');
    const [allAccounts, setAllAccounts] = useState([]); // To hold all accounts on the network

    useEffect(() => {
        const init = async () => {
            try {
                const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                setAllAccounts(accounts); // Store all accounts

                const networkId = await web3.eth.net.getId();
                const deployedNetwork = HelloWorldContract.networks[networkId];

                if (deployedNetwork) {
                    const instance = new web3.eth.Contract(
                        HelloWorldContract.abi,
                        deployedNetwork.address,
                    );
                    setContract(instance);
                } else {
                    console.error("Contract not found on the network:", networkId);
                    setError("Contract not deployed on this network");
                }
            } catch (error) {
                console.error("Initialization Error:", error);
                setError(error.message);
            }
        };
        init();
    }, []);

    // Clear fetched messages whenever the recipient changes
    useEffect(() => {
        setFetchedMessages([]); // Reset fetched messages
    }, [recipient]); // Dependency array containing recipient

    const sendMessage = async () => {
        if (!recipient || !message) {
            alert("Recipient address and message cannot be empty.");
            return;
        }

        if (contract) {
            try {
                const gasEstimate = await contract.methods.sendMessage(recipient, message).estimateGas({ from: account });
                await contract.methods.sendMessage(recipient, message).send({ from: account, gas: gasEstimate + 100000 });
                alert("Message sent!");
                setMessage(''); // Clear the message input after sending
            } catch (error) {
                console.error("Transaction Error:", error);
                alert("Transaction failed: " + error.message);
                setError(error.message);
            }
        } else {
            alert("Contract not initialized.");
        }
    };

    const fetchMessages = async () => {
        if (!recipient) {
            alert("Recipient address cannot be empty.");
            return;
        }

        if (contract) {
            try {
                const results = await contract.methods.getMessages(recipient).call();
                setFetchedMessages(results); // Update the fetched messages state
            } catch (error) {
                console.error("Error fetching messages:", error);
                alert("Error fetching messages: " + error.message);
                setError(error.message);
            }
        } else {
            alert("Contract not initialized.");
        }
    };

    return (
        <div>
            <h1>Hello World Chat DApp</h1>
            <p>Your Ethereum Address: {account}</p>
            <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            <input
                type="text"
                placeholder="Enter a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send Message</button>
            <button onClick={fetchMessages}>Fetch Messages</button>

            <h2>Messages for {recipient}</h2>
            {fetchedMessages.length > 0 ? (
                <ul>
                    {fetchedMessages.map((msg, index) => (
                        <li key={index}>{msg}</li> // Display all messages for the recipient
                    ))}
                </ul>
            ) : (
                <p>No messages found for this recipient.</p>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default App;
