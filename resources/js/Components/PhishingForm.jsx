import { useForm } from "@inertiajs/react";
import { useState } from "react";

export default function PhishingForm() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    subject: "",
    link: "",
    goal: "",
  });

  const [result, setResult] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("ai.generate"), {
      onSuccess: (response) => {
        setResult(response.props.generated);
      },
    });
  };

  return (
    <div className="mt-6 p-6 bg-gray-900 rounded text-white border border-gray-600">
      <h2 className="text-xl font-bold mb-4">🎯 Generate Phishing Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={processing}
          className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
        >
          Generate Email
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
