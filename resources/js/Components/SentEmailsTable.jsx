import React, { useEffect, useState } from "react";

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

  return (
    <div className="mt-12">
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold mb-4">Sent Emails</h2>

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

            {/* Pagination controls */}
            <div className="space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
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
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 