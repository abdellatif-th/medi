import { useForm } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import { Head, Link } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PhishingForm({ auth }) {
  const [generated, setGenerated] = useState(null);
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    subject: "",
    goal: "",
    link: "",
    generated_message: "", 

  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(route("phishing.generate"), data);
      setGenerated(response.data.generated);
      setData("generated_message", response.data.generated);
    } catch (err) {
      console.error(err);
      setGenerated("❌ Something went wrong.");
    }
  };

  return (

     <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight ">
          Phishing Email Generator
        </h2>
      }
    >
      <Head title="Phishing Email Generator" />
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
          type="text"
          placeholder="Subject"
          value={data.subject}
          onChange={(e) => setData("subject", e.target.value)}
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
        ></textarea>
        <button
          type="submit"
          disabled={processing}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate
        </button>
      </form>

      {generated && (
        <div className="mt-6">
            <label className="block text-white font-semibold mb-2">Generated Email</label>
            <textarea
            value={data.generated_message}
            onChange={(e) => setData("generated_message", e.target.value)}
            className="w-full p-4 border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
            rows={10}
            />
            {errors.generated_message && (
            <p className="text-red-500 text-sm mt-1">{errors.generated_message}</p>
            )}
        </div>
        )}

    </div>
    </AuthenticatedLayout>
  );
}
