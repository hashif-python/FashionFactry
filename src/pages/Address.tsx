import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    protectedGet,
    protectedPost,
    protectedPut,
    protectedDelete,
} from "../lib/protectedApi";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Pencil, Trash2, Star, Plus } from "lucide-react";

export const Address = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingAddress, setEditingAddress] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        pincode: "",
        address_line: "",
        city: "",
        state: "",
        is_default: false,
    });

    /* ------------------------------------------
        LOAD ADDRESSES
    ------------------------------------------ */
    const loadAddresses = async () => {
        const data = await protectedGet("address/", navigate);
        if (data) setAddresses(data);
        setLoading(false);
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    /* ------------------------------------------
        SUBMIT FORM (ADD OR EDIT)
    ------------------------------------------ */
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const payload = { ...formData };

        let res;

        if (editingAddress) {
            // UPDATE ADDRESS
            res = await protectedPut(
                `address/${editingAddress.id}/`,
                payload,
                navigate
            );
            toast.success("Address updated");
        } else {
            // CREATE NEW ADDRESS
            res = await protectedPost("address/", payload, navigate);
            toast.success("Address added");
        }

        if (res) {
            setEditingAddress(null);
            setFormData({
                full_name: "",
                phone: "",
                pincode: "",
                address_line: "",
                city: "",
                state: "",
                is_default: false,
            });
            loadAddresses();
        }
    };

    /* ------------------------------------------
        DELETE ADDRESS
    ------------------------------------------ */
    const handleDelete = async (id: number) => {
        const res = await protectedDelete(`address/${id}/`, navigate);

        if (res) {
            toast.success("Address deleted");
            loadAddresses();
        }
    };

    /* ------------------------------------------
        SET DEFAULT ADDRESS
    ------------------------------------------ */
    const setDefault = async (id: number) => {
        const res = await protectedPut(
            `address/${id}/`,
            { is_default: true },
            navigate
        );

        if (res) {
            toast.success("Default address updated");
            loadAddresses();
        }
    };

    /* ------------------------------------------
        START EDITING
    ------------------------------------------ */
    const startEdit = (addr: any) => {
        setEditingAddress(addr);
        setFormData({
            full_name: addr.full_name,
            phone: addr.phone,
            pincode: addr.pincode,
            address_line: addr.address_line,
            city: addr.city,
            state: addr.state,
            is_default: addr.is_default,
        });
    };

    /* ------------------------------------------
        LOADING UI
    ------------------------------------------ */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 text-white">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">My Addresses</h1>

                    <button
                        onClick={() => {
                            setEditingAddress(null);
                            setFormData({
                                full_name: "",
                                phone: "",
                                pincode: "",
                                address_line: "",
                                city: "",
                                state: "",
                                is_default: false,
                            });
                        }}
                        className="flex items-center gap-2 bg-[#C8A962] px-4 py-2 rounded-lg font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Add Address
                    </button>
                </div>

                {/* FORM */}
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        {editingAddress ? "Edit Address" : "Add New Address"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <input
                            type="text"
                            required
                            placeholder="Full Name"
                            className="w-full px-4 py-2 rounded-lg text-black"
                            value={formData.full_name}
                            onChange={(e) =>
                                setFormData({ ...formData, full_name: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            required
                            placeholder="Phone"
                            className="w-full px-4 py-2 rounded-lg text-black"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />

                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="text"
                                required
                                placeholder="Pincode"
                                className="px-4 py-2 rounded-lg text-black"
                                value={formData.pincode}
                                onChange={(e) =>
                                    setFormData({ ...formData, pincode: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                required
                                placeholder="City"
                                className="px-4 py-2 rounded-lg text-black"
                                value={formData.city}
                                onChange={(e) =>
                                    setFormData({ ...formData, city: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                required
                                placeholder="State"
                                className="px-4 py-2 rounded-lg text-black"
                                value={formData.state}
                                onChange={(e) =>
                                    setFormData({ ...formData, state: e.target.value })
                                }
                            />
                        </div>

                        <textarea
                            rows={3}
                            required
                            placeholder="Full Address"
                            className="w-full px-4 py-2 rounded-lg text-black"
                            value={formData.address_line}
                            onChange={(e) =>
                                setFormData({ ...formData, address_line: e.target.value })
                            }
                        />

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_default}
                                onChange={(e) =>
                                    setFormData({ ...formData, is_default: e.target.checked })
                                }
                            />
                            Make this my default address
                        </label>

                        <button
                            type="submit"
                            className="bg-[#C8A962] px-6 py-2 rounded-lg font-semibold mt-2"
                        >
                            {editingAddress ? "Update Address" : "Add Address"}
                        </button>
                    </form>
                </div>

                {/* ADDRESS LIST */}
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="bg-white/10 p-6 rounded-xl flex justify-between items-start backdrop-blur-md"
                        >
                            <div>
                                {addr.is_default && (
                                    <span className="px-2 py-1 bg-green-600 rounded text-xs">
                                        Default
                                    </span>
                                )}

                                <p className="font-semibold text-lg mt-1">{addr.full_name}</p>
                                <p className="text-white/80">{addr.phone}</p>
                                <p className="text-white/80">{addr.address_line}</p>
                                <p className="text-white/80">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">

                                {!addr.is_default && (
                                    <button
                                        onClick={() => setDefault(addr.id)}
                                        className="px-3 py-1 bg-blue-600 rounded-lg text-sm"
                                    >
                                        Set Default
                                    </button>
                                )}

                                <button
                                    onClick={() => startEdit(addr)}
                                    className="p-2 bg-white/20 rounded-lg"
                                >
                                    <Pencil className="w-5 h-5 text-white" />
                                </button>

                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="p-2 bg-red-600 rounded-lg"
                                >
                                    <Trash2 className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {addresses.length === 0 && (
                        <p className="text-center text-white/60">No addresses added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
