"use client";


import Transactions from "./Transactions";
import Bank from "./Bank_Details";
import Payout from "./Payout";
import { useState } from "react";

import "./Main.css";

const TutorTransactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payout'>('transactions');
  return (
    <div className="container-fluid">
      <div className="text-end">
        <Bank />
      </div>
      <div className="mb-4 d-flex notification-tabs-responsive">
        <button
          className={`notification-pill-btn${activeTab === 'transactions' ? ' active' : ''}`}
          onClick={() => setActiveTab('transactions')}
          type="button"
        >
          Transactions
        </button>
        <button
          className={`notification-pill-btn${activeTab === 'payout' ? ' active' : ''}`}
          onClick={() => setActiveTab('payout')}
          type="button"
        >
          Payout
        </button>
      </div>
      <div>
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'payout' && <Payout />}
      </div>
    </div>
  );
};

export default TutorTransactions;