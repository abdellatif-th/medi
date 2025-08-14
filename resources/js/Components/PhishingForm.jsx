import { router, useForm } from "@inertiajs/react";
import { useState, useRef  } from "react";
import axios from "axios";
import Papa from "papaparse";

export default function PhishingForm({ onEmailSent }) {
  const { data, setData, errors } = useForm({
    name: "",
    email: "", // can be multiple emails separated by commas
    link: "",
    goal: "",
    generated_email: "",
  });
  const [csvEmails, setCsvEmails] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [generated, setGenerated] = useState("");
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    complete: (results) => {
      const emails = results.data
        .flat()
        .map((email) => email.trim())
        .filter((email) => email);
      setCsvEmails(emails);
      showNotification("success", `✅ ${emails.length} emails loaded from CSV`);
    },
  });
};
  const templates = [
    {
      title: "Réinitialisation de mot de passe",
      name: "Alerte de réinitialisation de mot de passe:",
      email: "tectanja@gmail.com",
      link: "https://secure-login.example.com/reset",
      goal: "Inciter l'utilisateur à réinitialiser urgemment son mot de passe",
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Facture frauduleuse",
      name: "Paiement de facture requis:",
      email: "tectanja@gmail.com",
      link: "https://billing.example.com/pay",
      goal: "Amener l'utilisateur à payer une fausse facture",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      title: "Page de connexion factice",
      name: "Vérification du compte:",
      email: "tectanja@gmail.com",
      link: "https://secure.example.com/login",
      goal: "Récupérer les identifiants de connexion de l'utilisateur",
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Notification de livraison",
      name: "Échec de livraison - Action requise:",
      email: "tectanja@gmail.com",
      link: "https://tracking.example.com/update",
      goal: "Amener l'utilisateur à cliquer sur un faux lien de suivi",
      color: "from-green-400 to-emerald-600",
    },
  ];

  const loadTemplate = (tpl) => {
    setData("name", tpl.name);
    setData("email", tpl.email);
    setData("link", tpl.link);
    setData("goal", tpl.goal);
    showNotification("success", `Template "${tpl.title}" loaded`);
  };

  const showNotification = (type, message) => {
    setStatus(type);
    setStatusMessage(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  };

  // Step 1: Generate email (only uses the first email in the field)
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Pick first email from CSV if available, otherwise from manual input
  const firstEmail = csvEmails.length > 0
    ? csvEmails[0]
    : data.email.split(",")[0]?.trim();

  if (!data.name || !firstEmail || !data.link) {
    showNotification("error", "❗ At least one Email and Link are required.");
    return;
  }

  setProcessing(true);
  try {
    const response = await axios.post(route("phishing.generate"), {
      ...data,
      email: firstEmail,
    });
    setGenerated(response.data.generated);
    setData("generated_email", response.data.generated);
  } catch (err) {
    console.error(err);
    if (err.response?.data?.errors) {
      const firstError = Object.values(err.response.data.errors)[0][0];
      showNotification("error", `❌ ${firstError}`);
    } else {
      showNotification("error", "❌ Failed to generate email.");
    }
  } finally {
    setProcessing(false);
  }
};


  // Step 2: Send email to all recipients
  const handleSend = async () => {
  if (!generated.trim()) {
    showNotification("error", "❗ Please generate an email before sending.");
    return;
  }

  const emails = csvEmails.length > 0
    ? csvEmails
    : data.email.split(",").map(e => e.trim()).filter(Boolean);

  if (!emails.length) {
    showNotification("error", "❗ Please enter at least one email or upload a CSV.");
    return;
  }

  try {
    setSending(true);
    await Promise.all(
      emails.map((email) =>
        axios.post(route("phishing.send"), { ...data, email, generated_email: generated })
      )
    );
    showNotification("success", `✅ ${emails.length} emails sent successfully!`);
    if (onEmailSent) onEmailSent();
    router.reload();
  } catch (err) {
    console.error(err);
    showNotification("error", "❌ Failed to send some emails.");
  } finally {
    setSending(false);
  }
};


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Form Section */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Phishing Email Generator
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="From Name"
              value={data.from_name || ""}
              onChange={(e) => setData("from_name", e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              placeholder="From Email"
              value={data.from_email || ""}
              onChange={(e) => setData("from_email", e.target.value)}
              className="w-full p-2 border rounded"
            />            

          <input
            type="text"
            placeholder="Attack Name/Type"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="To Emails (comma separated)"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            disabled={csvEmails.length > 0} // disable if CSV is uploaded
            className={`w-full p-2 border rounded ${
              csvEmails.length > 0 ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
          />
          <p className="text-xs text-gray-400 mt-1">
            {csvEmails.length > 0
              ? "Using emails from CSV file. Manual entry is disabled."
              : "Enter emails separated by commas, or upload a CSV file."}
          </p>

          {/* CSV Upload with X button */}
          <div className="relative w-full">
             <input
                type="file"
                accept=".csv"
                ref={fileInputRef} // <-- add ref here
                onChange={handleCSVUpload}
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            
            {csvEmails.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCsvEmails([]);            // clear emails in state
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // reset file input
                  }
                }}
                className="
                  absolute
                  top-1/2
                  right-2
                  -translate-y-1/2
                  bg-red-500
                  text-white
                  rounded-full
                  w-6 h-6
                  flex items-center justify-center
                  text-sm
                  font-bold
                  hover:bg-red-600
                  focus:outline-none
                "
              >
                ×
              </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Upload a CSV file with emails (one per line).
              </p>


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
            <label className="block text-gray-800 dark:text-white font-semibold mb-2">Generated Email</label>
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
          transition-all duration-500 ease-in-out transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}
          ${status === "success" ? "bg-emerald-600 shadow-lg" : "bg-rose-600 shadow-lg"}`}
      >
        {statusMessage}
      </div>
    </div>
  );
}
