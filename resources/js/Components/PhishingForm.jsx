import { router, useForm } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";

export default function PhishingForm({ onEmailSent }) {
  const { data, setData, processing, errors } = useForm({
    name: "",
    email: "",
    link: "",
    goal: "",
    generated_email: "", 

  });
const [generated, setGenerated] = useState("");
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);

// Show notification and auto-hide after 5s
  const showNotification = (type, message) => {
    setStatus(type);
    setStatusMessage(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  };

  // Generate phishing email (called on form submit)
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(route("ai.generate"), data);
      setGenerated(response.data.generated);
      setData("generated_email", response.data.generated);
    } catch (error) {
      console.error("Generation failed", error);
      setGenerated("❌ Failed to generate email.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(route("phishing.generate"), data);
      setGenerated(response.data.generated);
      setData("generated_email", response.data.generated);
    } catch (err) {
      console.error(err);
      setGenerated("❌ Something went wrong.");
    }
  };
 const handleSend = async () => {
  if (!generated.trim()) {
    showNotification("error", "❗ Please generate an email before sending.");
    return;
  }

  try {
    setSending(true);
    await axios.post(route("phishing.send"), {
      ...data,
      generated_email: generated,
    });
    showNotification("success", "✅ Email sent successfully!");

    // You don't need to call onEmailSent if you reload the page
    // But if you want, you can still call it before reload
    if (onEmailSent) onEmailSent();

    // Reload the current Inertia page to refresh data without full browser reload
    router.reload();

  } catch (err) {
    console.error(err);
    if (err.response && err.response.status === 422) {
      showNotification("error", "❌ Validation failed. Check console for details.");
    } else {
      showNotification("error", "❌ Failed to send email. Please try again.");
    }
  } finally {
    setSending(false);
  }
};


  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow mt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Phishing Email Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            className="w-full p-2 border rounded"
          />
          
          <input
            type="url"
            placeholder="https://example.com/"
            value={data.link}
            onChange={(e) => setData("link", e.target.value)}
            className="w-full p-2 border rounded"
          />
          {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
          <textarea
            placeholder="Goal (optional)"
            value={data.goal}
            onChange={(e) => setData("goal", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={processing}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center space-x-2"
            >
              Generate
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center space-x-2"
            >
              {sending && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              <span>{sending ? "Sending..." : "Send Email"}</span>
            </button>
          </div>
        </form>

        {generated && (
          <div className="mt-6">
            <label className="block text-white font-semibold mb-2">Generated Email</label>
            <textarea
              value={generated}
              onChange={(e) => setGenerated(e.target.value)}
              className="w-full p-4 border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
              rows={10}
            />
            {errors.generated_email && (
              <p className="text-red-500 text-sm mt-1">{errors.generated_email}</p>
            )}
          </div>
        )}
      

      
      <div
        className={`pointer-events-none fixed top-5 right-5 z-50 max-w-sm rounded px-6 py-4 text-white
          transition-all duration-500 ease-in-out transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}
          ${status === "success" ? "bg-green-600 shadow-lg" : "bg-red-600 shadow-lg"}`}
      >
        {statusMessage}
      </div>
    
  </div>
);
}
