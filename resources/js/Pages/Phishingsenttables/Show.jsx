import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function SentEmailsPage({ auth, emails }) {
  const [filterStatus, setFilterStatus] = useState("all");

  // Check if emails is undefined or null before filtering
  const filteredEmails = emails?.filter((email) => {
    if (filterStatus === "all") return true;

    if (filterStatus === "pending") return email.clicked !== 1;
    if (filterStatus === "clicked") return email.clicked === 1;

    return true; 
  }) || []; // Default to an empty array if emails is undefined

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Sent Emails
        </h2>
      }
    >
      <Head title="Sent Emails" />
      <div className="max-w-7xl mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow mt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Sent Emails</h2>

        {/* Filter dropdown */}
        <div className="mb-4">
          <label htmlFor="statusFilter" className="mr-2 font-semibold text-white">
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

        {filteredEmails.length === 0 ? (
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
                {filteredEmails.map((email) => (
                  <tr
                    key={email.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 text-white dark:hover:bg-gray-700"
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
    </AuthenticatedLayout>
  );
}
