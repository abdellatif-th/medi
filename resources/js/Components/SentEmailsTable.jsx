import React from "react";

export default function SentEmailsTable({ emails }) {
  return (
    <div className="mt-12">
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold mb-4">Sent Emails</h2>
          {emails.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No emails sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 uppercase text-xs text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3">Target</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr
                      key={email.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">{email.name}</td>
                      <td className="px-6 py-4">{email.email}</td>
                      <td className="px-6 py-4 space-x-2">
                        {email.sent === 1 && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-green-600">
                            Sent
                          </span>
                        )}
                        {email.opened === 1 && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-blue-600 ml-2">
                            Opened
                          </span>
                        )}
                        {email.clicked === 1 && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-orange-600 ml-2">
                            Clicked
                          </span>
                        )}
                        {email.clicked_url && (
                          <a
                            href={email.clicked_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline ml-2 text-purple-600"
                          >
                            link
                          </a>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(email.created_at).toLocaleString()}
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
