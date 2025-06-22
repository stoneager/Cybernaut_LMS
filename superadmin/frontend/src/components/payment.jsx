import React, { useEffect, useState } from "react";
import axios from "axios";
import paidIcon from "../assets/paid.svg";
import pendingIcon from "../assets/pending.svg";

const Payment = () => {
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
  });
  const [view, setView] = useState("salary");
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const currentMonth = new Date().getMonth();

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      const [adminsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5001/api/salary"),
        axios.get("http://localhost:5001/api/salary/stats/payments"),
      ]);
      setAdmins(adminsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch salary data:", err);
    }
  };

  const fetchTransactions = async (count = 10) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/salary/recent-transactions?count=${count}`);
      setTransactions(res.data.items);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const handleApprovePayment = async (admin) => {
    try {
      const res = await axios.post(`http://localhost:5001/api/salary/${admin._id}/pay`);
      const { orderId, amount, adminName } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "LMS Salary Payment",
        description: `Salary for ${adminName}`,
        order_id: orderId,
        handler: async function (response) {
          await axios.post(`http://localhost:5001/api/salary/${admin._id}/verify`, {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
          alert("Payment successful");
          window.location.reload();
        },
        prefill: { name: adminName },
        theme: { color: "#1F2937" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment initiation failed");
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white h-30 border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-700 mt-2">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-white h-30 border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Pending Payments</h3>
          <p className="text-2xl font-bold text-blue-700 mt-2">{stats.pendingPayments}</p>
        </div>
        <div className="bg-white h-30 border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Success Rate</h3>
          <p className="text-2xl font-bold text-blue-700 mt-2">
            {((stats.successfulPayments / (stats.successfulPayments + stats.failedPayments || 1)) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white h-30 border border-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h3 className="text-lg font-semibold text-blue-900">Failed Payments</h3>
          <p className="text-2xl font-bold text-blue-700 mt-2">{stats.failedPayments}</p>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6 gap-4">
        <button
          onClick={() => {
            setView("salary");
            fetchSalaryData();
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            view === "salary"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Monthly Salary Payments
        </button>
        <button
          onClick={() => {
            setView("transactions");
            fetchTransactions();
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            view === "transactions"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Recent Transactions
        </button>
      </div>

      {/* Salary View */}
      {view === "salary" && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Monthly Salary Payments</h2>
          <table className="w-full text-left text-sm border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-500">
                <th>Lecturer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Month</th>
                <th>Order ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {admins.map((admin, idx) => {
                const isPaid = admin.paidForMonth === currentMonth;
                const status = isPaid ? "Paid" : "Pending";
                return (
                  <tr key={idx} className="bg-white shadow-sm rounded-md">
                    <td className="py-3 px-2">{admin.user?.name || "Unnamed"}</td>
                    <td className="py-3 px-2 text-green-600 font-semibold">₹{admin.salary}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          isPaid
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <img
                          src={isPaid ? paidIcon : pendingIcon}
                          alt={status}
                          className="w-4 h-4"
                        />
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-2">{new Date().toLocaleString('default', { month: 'long' })}</td>
                    <td className="py-3 px-2">{admin.lastOrderId || "—"}</td>
                    <td className="py-3 px-2">
                      {!isPaid && (
                        <button
                          className="bg-black text-white px-2 py-1 text-xs rounded"
                          onClick={() => handleApprovePayment(admin)}
                        >
                          Approve
                        </button>
                      )}
                      {isPaid && admin.invoiceId && (
                        <a
                          href={`http://localhost:5000/api/salary/invoice/${admin.invoiceId}`}
                          target="_blank"
                          className="ml-2 text-blue-600 underline text-xs"
                        >
                          View Invoice
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions View */}
      {view === "transactions" && (
  <div className="bg-white p-4 rounded shadow">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
      <h2 className="text-lg font-semibold">Recent Transactions</h2>

      <div className="flex flex-col md:flex-row gap-3 items-center">
        <input
          type="text"
          className="border px-2 py-1 rounded text-sm"
          placeholder="Search by ID, method, status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border px-2 py-1 rounded text-sm"
          onChange={(e) => fetchTransactions(Number(e.target.value))}
        >
          <option value="5">Last 5</option>
          <option value="10">Last 10</option>
          <option value="50">Last 50</option>
        </select>
      </div>
    </div>

    <table className="w-full text-sm border-separate border-spacing-y-2">
      <thead className="text-gray-500">
        <tr>
          <th>Transaction ID</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Method</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {transactions
          .filter(tx =>
            tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.method || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.status.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((tx, idx) => (
            <tr key={idx} className="bg-gray-50 rounded">
              <td className="py-2 px-2">{tx.id}</td>
              <td className="py-2 px-2">₹{(tx.amount / 100).toFixed(2)}</td>
              <td className="py-2 px-2 capitalize">{tx.status}</td>
              <td className="py-2 px-2">{tx.method || "-"}</td>
              <td className="py-2 px-2">{new Date(tx.created_at * 1000).toLocaleString()}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
};

export default Payment;
