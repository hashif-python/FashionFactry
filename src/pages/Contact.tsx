import { useState } from "react";
import { apiPost } from "../lib/api";
import toast from "react-hot-toast";

export const Contact = () => {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const submitForm = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiPost("contact/", form);

            toast.success("Message sent successfully!");
            setForm({
                name: "",
                email: "",
                mobile: "",
                subject: "",
                message: "",
            });
        } catch (err: any) {
            toast.error(err?.message || "Failed to send message");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen py-16 px-6 flex items-center justify-center text-white">
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl">

                <h1 className="text-4xl font-bold text-[#C8A962] mb-3">
                    Contact Us
                </h1>

                <p className="text-white/70 mb-8">
                    Have questions or need support? Reach out to us—our team will respond soon.
                </p>

                <form onSubmit={submitForm} className="space-y-5">

                    <div>
                        <label className="block mb-2 text-sm">Full Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-white text-black focus:ring-2 focus:ring-[#C8A962]"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Email *</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-white text-black focus:ring-2 focus:ring-[#C8A962]"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Mobile *</label>
                        <input
                            name="mobile"
                            value={form.mobile}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-white text-black focus:ring-2 focus:ring-[#C8A962]"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Subject *</label>
                        <input
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md bg-white text-black focus:ring-2 focus:ring-[#C8A962]"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm">Message *</label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            rows={4}
                            required
                            className="w-full p-3 rounded-md bg-white text-black focus:ring-2 focus:ring-[#C8A962]"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C8A962] py-3 rounded-md font-semibold text-white hover:bg-[#b29755] transition"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>

            </div>
        </div>
    );
};
