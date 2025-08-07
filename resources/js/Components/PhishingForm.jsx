import { useForm } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";

export default function PhishingForm() {
  const { data, setData, processing, errors } = useForm({
    name: "",
    email: "",
    subject: "",
    link: "",
    goal: "",
  });
const [generated, setGenerated] = useState(""); 
const [status, setStatus] = useState(null);
const [statusMessage, setStatusMessage] = useState("");


  // Handle generating email from AI
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(route("ai.generate"), data);
      setGenerated(response.data.generated); // store AI response
    } catch (error) {
      console.error("Generation failed", error);
      setGenerated("❌ Failed to generate email.");
    }
  };

  // Handle sending the email
   const handleSend = async () => {
  if (!generated.trim()) {
    setStatus("error");
    setStatusMessage("❗ Please generate an email before sending.");
    return;
  }

  try {
    await axios.post(route("phishing.send"), {
      ...data,
      generated_email: generated,
    });

    setStatus("success");
    setStatusMessage("✅ Email sent successfully!");
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.error("Validation Errors:", err.response.data.errors);
      setStatus("error");
      setStatusMessage("❌ Validation failed. Check console for details.");
    } else {
      console.error(err);
      setStatus("error");
      setStatusMessage("❌ Failed to send email. Please try again.");
    }
  }
};


  return (
    <div className="mt-6 p-6 bg-gray-900 rounded text-white border border-gray-600">
      <h2 className="text-xl font-bold mb-4">🎯 Generate Phishing Email</h2>

      <form className="space-y-4" onSubmit={handleGenerate}>
        <div>
          <label className="block mb-1">Target Name</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
          />
          {errors.name && <p className="text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label className="block mb-1">Target Email</label>
          <input
            type="email"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
          />
          {errors.email && <p className="text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label className="block mb-1">Subject</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            value={data.subject}
            onChange={(e) => setData("subject", e.target.value)}
          />
          {errors.subject && <p className="text-red-400">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Phishing Link</label>
          <input
            type="url"
            className="w-full border px-3 py-2 rounded"
            value={data.link}
            onChange={(e) => setData("link", e.target.value)}
            placeholder="https://malicious.example.com"
          />
          {errors.link && <p className="text-red-500">{errors.link}</p>}
        </div>

        <div>
          <label className="block mb-1">Goal (optional)</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            value={data.goal}
            onChange={(e) => setData("goal", e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate Email
        </button>
      </form>

      {generated && (
        <div className="mt-6">
          <label className="block text-white font-semibold mb-2">
            Generated Email
          </label>
          <textarea
            value={generated}
            onChange={(e) => setGenerated(e.target.value)}
            className="w-full mt-2 border p-2 rounded bg-gray-800 text-white"
            rows={10}
          />
          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSend}
          >
            Send Email
          </button>
                <div className={`mt-4 px-4 py-2 rounded ${ status === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}
              >
              </div>
        </div>
      )}
        
            {status && (
              <div
                className={`mt-4 px-4 py-2 rounded ${
                  status === "success"
                    ? "bg-green-700 text-white"
                    : "bg-red-700 text-white"
                }`}
              >
                {statusMessage}
              </div>
            )}
    </div>
  );
}
