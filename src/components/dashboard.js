import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newAccount, setNewAccount] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    currency: "USD",
    userEmail: "", // Use email instead of userId
  });
  const [transferDetails, setTransferDetails] = useState({
    recipientAccountNumber: "",
    amount: "",
  });
  const [accountError, setAccountError] = useState(null);
  const [accountSuccess, setAccountSuccess] = useState(null);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [filterCriteria, setFilterCriteria] = useState({
    name: "",
    accountNumber: "",
    minBalance: "",
  }); // State for filter criteria
  const [allAccountList, setAllAccountList] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/accounts");
      const userAccounts = user.isAdmin
        ? data
        : data.filter((account) => account.userId === user.id);
      setAccounts(userAccounts);
      setAllAccountList([...data]);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAccount({ ...newAccount, [name]: value });
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferDetails({ ...transferDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if the user exists by email
      const selectedUser = users.find(
        (user) => user.email === newAccount.userEmail
      );

      if (!selectedUser) {
        setAccountError("User not found.");
        setAccountSuccess(null);
        return;
      }

      const existingAccount = accounts.find(
        (account) => account.userId === selectedUser.id
      );

      if (existingAccount) {
        setAccountError("This user already has an account.");
        setAccountSuccess(null);
        return;
      }

      // Create a new account
      const accountNumber =
        "ACC-" + Math.floor(Math.random() * 1000000).toString();
      await axios.post("http://localhost:5000/accounts", {
        ...newAccount,
        userId: selectedUser.id, // Use the ID of the selected user
        accountNumber,
        balance: 10000,
      });
      setAccountSuccess("Account created successfully!");
      setAccountError(null);
      fetchAccounts();
    } catch (err) {
      setAccountError(err.message);
      setAccountSuccess(null);
      console.error("Failed to create account:", err);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const { recipientAccountNumber, amount } = transferDetails;

      const senderAccount = accounts.find(
        (account) => account.userId === user.id
      );

      const recipientAccount = allAccountList.find(
        (account) => account.accountNumber === recipientAccountNumber.trim()
      );

      if (
        !recipientAccount ||
        recipientAccount.userId === senderAccount.userId
      ) {
        setTransferError("Invalid recipient account number.");
        setTransferSuccess(null);
        return;
      }

      if (senderAccount.balance < parseFloat(amount)) {
        setTransferError("Insufficient funds.");
        setTransferSuccess(null);
        return;
      }

      // Update balances
      await axios.patch(`http://localhost:5000/accounts/${senderAccount.id}`, {
        balance: senderAccount.balance - parseFloat(amount),
      });
      await axios.patch(
        `http://localhost:5000/accounts/${recipientAccount.id}`,
        {
          balance: recipientAccount.balance + parseFloat(amount),
        }
      );

      // Log the transaction for sender
      await axios.post("http://localhost:5000/transactions", {
        accountId: senderAccount.id,
        timestamp: new Date().toISOString(),
        description: `Transfer to ${recipientAccount.accountNumber}`,
        amount: -parseFloat(amount),
      });

      // Log the transaction for recipient
      await axios.post("http://localhost:5000/transactions", {
        accountId: recipientAccount.id,
        timestamp: new Date().toISOString(),
        description: `Transfer from ${senderAccount.accountNumber}`,
        amount: parseFloat(amount),
      });

      setTransferSuccess("Transfer successful.");
      setTransferError(null);
      fetchAccounts();
    } catch (err) {
      setTransferError(err.message);
      setTransferSuccess(null);
      console.error("Failed to transfer funds:", err);
    }
  };

  // Search and filter logic
  const filteredAccounts = accounts.filter((account) => {
    const nameMatch = `${account.firstName} ${account.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const accountNumberMatch = account.accountNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const balanceMatch =
      account.balance >= parseFloat(filterCriteria.minBalance || 0);
    return (
      (nameMatch || accountNumberMatch) &&
      balanceMatch &&
      (!filterCriteria.name ||
        `${account.firstName} ${account.lastName}`
          .toLowerCase()
          .includes(filterCriteria.name.toLowerCase())) &&
      (!filterCriteria.accountNumber ||
        account.accountNumber
          .toLowerCase()
          .includes(filterCriteria.accountNumber.toLowerCase()))
    );
  });

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-container">
        <div className="dashboard-left">
          {user.isAdmin && (
            <>
              <div className="create-account-form">
                <h3>Create Account</h3>
                {accountError && <p className="error">{accountError}</p>}
                {accountSuccess && <p className="success">{accountSuccess}</p>}
                <form onSubmit={handleSubmit}>
                  <input
                    name="firstName"
                    placeholder="First Name"
                    onChange={handleChange}
                    required
                  />
                  <input
                    name="lastName"
                    placeholder="Last Name"
                    onChange={handleChange}
                    required
                  />
                  <input
                    name="dateOfBirth"
                    type="date"
                    onChange={handleChange}
                    required
                  />
                  <input
                    name="address"
                    placeholder="Address"
                    onChange={handleChange}
                    required
                  />
                  <select name="currency" onChange={handleChange} required>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    name="userEmail"
                    type="email"
                    placeholder="User Email"
                    onChange={handleChange}
                    required
                  />
                  <button type="submit">Create Account</button>
                </form>
              </div>
            </>
          )}
          <div className="transfer-form">
            <h3>Fund Transfer</h3>
            {transferError && <p className="error">{transferError}</p>}
            {transferSuccess && <p className="success">{transferSuccess}</p>}
            <form onSubmit={handleTransferSubmit}>
              <input
                name="recipientAccountNumber"
                placeholder="Recipient Account Number"
                onChange={handleTransferChange}
                required
              />
              <input
                name="amount"
                type="number"
                placeholder="Amount"
                onChange={handleTransferChange}
                required
              />
              <button type="submit">Transfer</button>
            </form>
          </div>
        </div>
        <div className="dashboard-right">
          {user.isAdmin && (
            <>
              <div className="filter-form">
                <h3>Filter Accounts</h3>
                <input
                  name="searchTerm"
                  placeholder="Search by name or account number"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                  name="name"
                  placeholder="Filter by name"
                  onChange={(e) =>
                    setFilterCriteria({
                      ...filterCriteria,
                      name: e.target.value,
                    })
                  }
                />
                <input
                  name="accountNumber"
                  placeholder="Filter by account number"
                  onChange={(e) =>
                    setFilterCriteria({
                      ...filterCriteria,
                      accountNumber: e.target.value,
                    })
                  }
                />
                <input
                  name="minBalance"
                  type="number"
                  placeholder="Minimum Balance"
                  onChange={(e) =>
                    setFilterCriteria({
                      ...filterCriteria,
                      minBalance: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
          {user.isAdmin ? <h3>Account List</h3> : <h3>Account Detail</h3>}
          <ul className="account-list">
            {filteredAccounts.map((account) => (
              <li key={account.id} className="account-item">
                <div>
                  <b>Account Number:</b> {account.accountNumber}
                </div>
                <div>
                  <b>First Name:</b> {account.firstName}
                </div>
                <div>
                  <b>Last Name:</b> {account.lastName}
                </div>
                <div>
                  <b>Date of Birth:</b> {account.dateOfBirth}
                </div>
                <div>
                  <b>Address:</b> {account.address}
                </div>
                <div>
                  <b>Currency:</b> {account.currency}
                </div>
                <div>
                  <b>Balance:</b> {account.balance}
                </div>
                <Link to={`/accounts/${account.id}/transactions`}>
                  View Transactions
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
