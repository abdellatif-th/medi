import { router, useForm } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PhishingForm({ auth }) {
  const { data, setData, errors } = useForm({
    name: "",
    email: "",
    link: "",
    goal: "",
    generated_email: "",
  });

  const [processing, setProcessing] = useState(false);
  const [generated, setGenerated] = useState("");
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);

  // Templates identical to reference
  const templates = [
    {
      title: "Password Reset",
      name: "Password Reset Alert",
      email: "security@example.com",
      link: "https://secure-login.example.com/reset",
      goal: "Prompt user to urgently reset their password",
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Invoice Scam",
      name: "Invoice Payment Needed",
      email: "billing@example.com",
      link: "https://billing.example.com/pay",
      goal: "Trick user into paying a fake invoice",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      title: "Fake Login Page",
      name: "Account Verification",
      email: "support@example.com",
      link: "https://secure.example.com/login",
      goal: "Steal login credentials",
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Delivery Notification",
      name: "Delivery Failed - Action Required",
      email: "no-reply@delivery.example",
      link: "https://tracking.example.com/update",
      goal: "Get user to click fake tracking link",
      color: "from-green-400 to-emerald-600",
    },
  ];

  // Load template fields
  const loadTemplate = (tpl) => {
    setData("name", tpl.name);
    setData("email", tpl.email);
    setData("link", tpl.link);
    setData("goal", tpl.goal);
    showNotification("success", `Template "${tpl.title}" loaded`);
  };

  // Notification logic
  const showNotification = (type, message) => {
    setStatus(type);
    setStatusMessage(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  };

  // Generate email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await axios.post(route("phishing.generate"), data);
      setGenerated(response.data.generated);
      setData("generated_email", response.data.generated);
    } catch (err) {
      console.error(err);
      setGenerated("❌ Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  // Send email
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
      router.reload();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 422) {
        showNotification("error", "❌ Validation failed.");
      } else {
        showNotification("error", "❌ Failed to send email. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Phishing Email Generator
        </h2>
      }
    >
      <Head title="Phishing Email Generator" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6">
        {/* Form Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Phishing Email Generator
          </h2>

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

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={processing}
                className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                {processing && <span className="loader mr-2" />}
                <span>{processing ? "Generating..." : "Generate"}</span>
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                {sending && <span className="loader mr-2" />}
                <span>{sending ? "Sending..." : "Send Email"}</span>
              </button>
            </div>
          </form>

          {generated && (
            <div className="mt-6">
              <label className="block text-gray-800 dark:text-white font-semibold mb-2">
                Generated Email
              </label>
              <textarea
                value={generated}
                onChange={(e) => setGenerated(e.target.value)}
                className="w-full p-4 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={10}
              />
              {errors.generated_email && (
                <p className="text-red-500 text-sm mt-1">{errors.generated_email}</p>
              )}
            </div>
          )}
        </div>

        {/* Templates Section */}
        <div className="p-5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Campaign Templates</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((tpl, idx) => (
              <div
                key={idx}
                onClick={() => loadTemplate(tpl)}
                className={`cursor-pointer rounded-lg p-3 shadow-md transform transition hover:scale-105 border border-gray-800 bg-gradient-to-r ${tpl.color}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{tpl.title}</h4>
                    <p className="text-xs text-white/90 mt-1">{tpl.name}</p>
                    <p className="text-xs text-white/80 mt-1">{tpl.goal}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadTemplate(tpl);
                    }}
                    className="ml-3 bg-white/20 text-white text-xs px-2 py-1 rounded"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Tip: After loading a template you can edit message fields before generating.
          </p>
        </div>

        {/* Notification */}
        <div
          className={`pointer-events-none fixed top-5 right-5 z-50 max-w-sm rounded px-6 py-4 text-white
            transition-all duration-500 ease-in-out transform ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
            }
            ${status === "success" ? "bg-emerald-600 shadow-lg" : "bg-rose-600 shadow-lg"}`}
        >
          {statusMessage}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
