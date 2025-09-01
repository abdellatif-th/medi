import { router, useForm, Head } from "@inertiajs/react";
import { useState, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PhishingForm({ onEmailSent, auth }) {
  const { data, setData, errors } = useForm({
    // Email attack params
    name: "",
    email: "", 
    link: "",
    goal: "",
    generated_email: "",
    subject: "", // New subject field
    // SMTP params
    mailer: "smtp",
    host: "127.0.0.1",
    port: "1025",
    username: "",
    password: "",
    encryption: "",
    from_email: "test@gmail.com",
    from_name: "test",
  });

  const [smtpStatus, setSmtpStatus] = useState("");
  const [csvEmails, setCsvEmails] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [generated, setGenerated] = useState("");
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

const checkConnection = async () => {


  setSmtpStatus("⏳ Checking connection...");
  try {
    const res = await axios.post("/smtp-check", {
      host: data.host,
      port: data.port,
      from_email: data.from_email,
      from_name: data.from_name,
      test_email: data.username, 
    });

    setSmtpStatus(res.data.message);
  } catch (err) {
    setSmtpStatus("❌ Authentication failed");
    console.error(err);
  }
};


  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const emails = results.data.flat().map((email) => email.trim()).filter(Boolean);
        setCsvEmails(emails);
        showNotification("success", `✅ ${emails.length} emails loaded from CSV`);
      },
    });
  };

  const templates = [
    { title: "Réinitialisation de mot de passe", name: "Alerte de réinitialisation de mot de passe", email: "tectanja@gmail.com", link: "http://127.0.0.1:8000/sensibilisationphishing", goal: "Inciter l'utilisateur à réinitialiser urgemment son mot de passe", color: "from-red-500 to-pink-500" },
    { title: "Facture frauduleuse", name: "Paiement de facture requis", email: "tectanja@gmail.com", link: "http://127.0.0.1:8000/sensibilisationphishing", goal: "Amener l'utilisateur à payer une fausse facture", color: "from-yellow-400 to-yellow-600" },
    { title: "Page de connexion factice", name: "Vérification du compte", email: "tectanja@gmail.com", link: "http://127.0.0.1:8000/sensibilisationphishing", goal: "Récupérer les identifiants de connexion de l'utilisateur", color: "from-indigo-500 to-blue-500" },
    { title: "Notification de livraison", name: "Échec de livraison - Action requise", email: "tectanja@gmail.com", link: "http://127.0.0.1:8000/sensibilisationphishing", goal: "Amener l'utilisateur à cliquer sur un faux lien de suivi", color: "from-green-400 to-emerald-600" },
    { title: "Téléchargement de document", name: "Votre document demandé est prêt ", email: "tectanja@gmail.com", link: "http://127.0.0.1:8000/safe-docs/sample.docx", goal: "Simuler le téléchargement d'un fichier pour formation interne", color: "from-purple-500 to-pink-500" },
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

  // Step 1: Generate email
  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstEmail = csvEmails.length > 0 ? csvEmails[0] : data.email.split(",")[0]?.trim();
    if (!data.name || !firstEmail || !data.link) {
      showNotification("error", "❗ At least one Email and Link are required.");
      return;
    }
    setProcessing(true);
    try {
      const response = await axios.post(route("phishing.generate"), { ...data, email: firstEmail });
      setGenerated(response.data.generated);
      setData("generated_email", response.data.generated);
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.status, err.response.data);
      } else {
        console.error("Axios error:", err.message);
      }

      showNotification("error", "❌ Failed to generate email.");
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Send email
  const handleSend = async () => {
    if (!generated.trim()) {
      showNotification("error", "❗ Please generate an email before sending.");
      return;
    }
    const emails = csvEmails.length > 0 ? csvEmails : data.email.split(",").map(e => e.trim()).filter(Boolean);
    if (!emails.length) {
      showNotification("error", "❗ Please enter at least one email or upload a CSV.");
      return;
    }
   try {
      setSending(true);
      await Promise.all(
        emails.map((email) =>
          axios.post(route("phishing.send"), { ...data, email, generated_email: generated, subject: data.subject})
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
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Phishing Email Generator</h2>}
    >
      <Head title="Phishing Email Generator" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6">
        {/* Form Section */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SMTP Settings */}
            <div className="p-4 border rounded bg-gray-50 dark:bg-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">SMTP Settings</h3>
              <input type="text" placeholder="Mailer (smtp)" value={data.mailer} onChange={(e) => setData("mailer", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="Host (smtp.gmail.com)" value={data.host} onChange={(e) => setData("host", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="number" placeholder="Port (587)" value={data.port} onChange={(e) => setData("port", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="Username" value={data.username} onChange={(e) => setData("username", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="password" placeholder="Password" value={data.password} onChange={(e) => setData("password", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="Encryption (tls/ssl)" value={data.encryption} onChange={(e) => setData("encryption", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="email" placeholder="From Email" value={data.from_email} onChange={(e) => setData("from_email", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="From Name" value={data.from_name} onChange={(e) => setData("from_name", e.target.value)} className="w-full p-2 border rounded mb-2" />
              <div>
                <button
                type="button"
                onClick={checkConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
              >
                Check Connection
              </button>
               {/*  SMTP Settings */}
                <p className="text-sm mt-1 text-white-900 dark:text-white">
                  {smtpStatus}
                </p>
              </div>
            </div>

            {/* Campaign fields */}
            <input type="text" placeholder="Attack Name/Type" value={data.name} onChange={(e) => setData("name", e.target.value)} className="w-full p-2 border rounded" />
            <input
              type="text"
              placeholder="Email Subject"
              value={data.subject}
              onChange={(e) => setData("subject", e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input type="text" placeholder="To Emails (comma separated)" value={data.email} onChange={(e) => setData("email", e.target.value)} disabled={csvEmails.length > 0} className={`w-full p-2 border rounded ${csvEmails.length > 0 ? "bg-gray-200 cursor-not-allowed" : ""}`} />
            <p className="text-xs text-gray-400">{csvEmails.length > 0 ? "Using emails from CSV file." : "Enter emails separated by commas, or upload a CSV file."}</p>

            {/* CSV Upload */}
            <div className="relative w-full">
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              {csvEmails.length > 0 && (
                <button type="button" onClick={() => { setCsvEmails([]); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-1/2 right-2 -translate-y-1/2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
              )}
            </div>

            <input type="url" placeholder="https://example.com/" value={data.link} onChange={(e) => setData("link", e.target.value)} className="w-full p-2 border rounded" />
            {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}

            <textarea placeholder="Goal (optional)" value={data.goal} onChange={(e) => setData("goal", e.target.value)} className="w-full p-2 border rounded" />

            <div className="flex gap-3 mt-2">
              <button type="submit" disabled={processing} className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded flex items-center">{processing ? "Generating..." : "Generate"}</button>
              <button type="button" onClick={handleSend} disabled={sending} className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center">{sending ? "Sending..." : "Send Email"}</button>
            </div>
          </form>

          {generated && (
            <div className="mt-6">
              <label className="block text-gray-800 dark:text-white font-semibold mb-2">Generated Email</label>
              <textarea value={generated} onChange={(e) => setGenerated(e.target.value)} className="w-full p-4 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" rows={10} />
              {errors.generated_email && <p className="text-red-500 text-sm mt-1">{errors.generated_email}</p>}
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="p-5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-lg border border-gray-800">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Quick Campaign Templates</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((tpl, idx) => (
              <div key={idx} onClick={() => loadTemplate(tpl)} className={`cursor-pointer rounded-lg p-3 shadow-md transform transition hover:scale-105 border border-gray-800 bg-gradient-to-r ${tpl.color}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{tpl.title}</h4>
                    <p className="text-xs text-white/90 mt-1">{tpl.name}</p>
                    <p className="text-xs text-white/80 mt-1">{tpl.goal}</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); loadTemplate(tpl); }} className="ml-3 bg-white/20 text-white text-xs px-2 py-1 rounded">Load</button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">Tip: After loading a template you can edit message fields before generating.</p>
        </div>

        {/* Notification */}
        <div className={`pointer-events-none fixed top-5 right-5 z-50 max-w-sm rounded px-6 py-4 text-white transition-all duration-500 ease-in-out transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"} ${status === "success" ? "bg-emerald-600 shadow-lg" : "bg-rose-600 shadow-lg"}`}>{statusMessage}</div>
      </div>
    </AuthenticatedLayout>
  );
}
