import React, { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";


export default function SentEmailsTable({ emails }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [prevStatuses, setPrevStatuses] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 5;

  useEffect(() => {
    // Extract current statuses
    const currentStatuses = emails.map(email => email.clicked);

    // Compare with previous statuses
    if (prevStatuses.length > 0) {
      emails.forEach((email, idx) => {
        if (email.clicked !== prevStatuses[idx]) {
          alert(`Status changed for ${email.email}: ${email.clicked === 1 ? "Clicked" : "Pending"}`);
        }
      });
    }

    setPrevStatuses(currentStatuses);
  }, [emails]);

  const filteredEmails = emails.filter((email) => {
    if (filterStatus === "all") return true;

    if (filterStatus === "pending") return email.clicked !== 1;
    if (filterStatus === "clicked") return email.clicked === 1;

    return true;
  });

  //CSV EXPORT REPORTS:
  const exportToCSV = () => {
    // Prepare CSV header
    const headers = ["Target", "Email", "Status", "Sent At", "Clicked Link"];

    // Prepare rows from filtered data
    const rows = filteredEmails.map(email => [
      email.name,
      email.email,
      email.clicked === 1 ? "Clicked" : "Pending",
      new Date(email.created_at).toLocaleString(),
      email.clicked_url || "No link clicked"
    ]);

    // Combine headers + rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(item => `"${item}"`).join(","))
      .join("\n");

    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sent_emails.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination calculations
  const totalEmails = filteredEmails.length;
  const totalPages = Math.ceil(totalEmails / emailsPerPage);
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);

  // Handlers for pagination buttons
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Calcul du CTR
  const clickedCount = filteredEmails.filter(e => e.clicked === 1).length;
  const ctrPercent = totalEmails > 0 ? ((clickedCount / totalEmails) * 100).toFixed(1) : "0";

const pieData = [
  { name: "Clicked", value: clickedCount },
  { name: "Pending", value: totalEmails - clickedCount }
];
const COLORS = ["#0c7e06ff", "#766f6fff"]; // green, gray

const barData = [
  { name: "Total Sent", value: totalEmails },
  { name: "Clicked", value: clickedCount },
  { name: "CTR (%)", value: parseFloat(ctrPercent) }
];

  return (
    <div className="mt-12">
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold mb-4">Sent Emails</h2>
        
                    {/* Stat boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Total Sent */}
              <div className="flex flex-col items-center justify-center bg-[#0ea0efff] p-6 rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="text-3xl font-bold">{totalEmails}</div>
                <div className="text-lg font-medium">Total Sent</div>
              </div>

              {/* Clicked */}

              <div className="flex flex-col items-center justify-center bg-[#0c7e06]  rounded-2xl shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a5 5 0 00-5 5v10a5 5 0 0010 0V7a5 5 0 00-5-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v4" />
              </svg>
                <div className="text-3xl font-bold">{clickedCount}</div>
                <div className="text-lg font-medium">Clicked</div>
              </div>

              {/* CTR */}
              <div className="flex flex-col items-center justify-center bg-purple-100 dark:bg-purple-800 text-purple-900 dark:text-purple-100 p-6 rounded-2xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zM5.5 20a6.5 6.5 0 1113 0h-13z" />
                </svg>
                <div className="text-3xl font-bold">{ctrPercent}%</div>
                <div className="text-lg font-medium">CTR</div>
              </div>
            </div>
          {/* Pie Chart */}   
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-bold mb-4">Click Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

              {/* Bar Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                <h3 className="text-lg font-bold mb-4">Email Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#ffffff" />
                    <YAxis stroke="#ffffff"/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0ea0efff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>



          {/* Filter dropdown */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <label htmlFor="statusFilter" className="mr-2 font-semibold">
                Filter by Status:
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">All</option>
                <option value="clicked">Clicked</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            
          </div>

          {currentEmails.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No emails found.</p>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 uppercase text-xs text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Target</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Sent At</th>
                    <th className="px-6 py-3">Clicked Link</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmails.map((email) => (
                    <tr
                      key={email.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">{email.name}</td>
                      <td className="px-6 py-4">{email.email}</td>
                      <td className="px-6 py-4 space-x-2">
                        {email.clicked === 1 ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-green-600 ml-2">
                            Clicked
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-gray-500 ml-2">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(email.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {email.clicked_url ? (
                          <a
                            href={email.clicked_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-purple-600"
                          >
                            {email.clicked_url}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">No link clicked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="flex items-center space-x-2  mt-4 float-right ">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
