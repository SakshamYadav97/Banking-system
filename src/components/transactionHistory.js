import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TransactionHistory() {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/transactions?accountId=${accountId}`
      );
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  return (
    <div className="transactions">
      <h1>Transaction History</h1>
      {error && <p className="error">Error: {error}</p>}
      <ul>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <li key={transaction.id}>
              {new Date(transaction.timestamp).toLocaleString()} -{" "}
              {transaction.description} - ${transaction.amount}
            </li>
          ))
        ) : (
          <p>No transactions found.</p>
        )}
      </ul>
    </div>
  );
}

export default TransactionHistory;
