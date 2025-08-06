import { useState } from 'react'
import axios from 'axios'

export default function PhishingForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        goal: '',
    })

    const [generatedEmail, setGeneratedEmail] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setGeneratedEmail(null)
        setLoading(true)

        try {
            const response = await axios.post('/ai/generate', formData)
            setGeneratedEmail(response.data.generated)
        } catch (error) {
            console.error(error)
            setGeneratedEmail("Error generating email.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-6">🎯 AI Phishing Email Generator</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Target Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Target Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Subject</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Goal (e.g., fake invoice, password reset)</label>
                    <input
                        type="text"
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {loading ? 'Generating...' : 'Generate Email Automatically'}
                </button>
            </form>

            {generatedEmail && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">📧 AI-Generated Email:</h3>
                    <div className="bg-gray-100 p-4 rounded whitespace-pre-line border">
                        {generatedEmail}
                    </div>
                </div>
            )}
        </div>
    )
}
