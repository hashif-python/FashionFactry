import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    protectedGet,
    protectedPost,
    protectedPostMultipart,
} from "../lib/protectedApi";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    PackageCheck,
    Truck,
    Clock3,
    CheckCircle,
    XCircle,
    RotateCcw,
    HelpCircle,
} from "lucide-react";

export const OrderDetail = () => {
    const navigate = useNavigate();
    const { order_id } = useParams();

    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // CANCEL modal
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelItemId, setCancelItemId] = useState<number | null>(null);
    const [cancelRefundMethod, setCancelRefundMethod] = useState("wallet");

    // RETURN modal
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [returnItemId, setReturnItemId] = useState<number | null>(null);
    const [returnReason, setReturnReason] = useState("");
    const [returnRefundMethod, setReturnRefundMethod] = useState("wallet");
    const [returnImages, setReturnImages] = useState<any>({
        image_1: null,
        image_2: null,
        image_3: null,
    });




    // PAYMENT RETRY modal
    const [retryModalOpen, setRetryModalOpen] = useState(false);

    // ⭐ REVIEW modal
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewProductId, setReviewProductId] = useState<number | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewImage, setReviewImage] = useState<File | null>(null);

    /* -------------------------------------------------------
          LOAD ORDER
    ------------------------------------------------------- */
    useEffect(() => {
        loadOrder();
    }, []);

    const loadOrder = async () => {
        const data = await protectedGet(`orders/${order_id}/`, navigate);
        if (data) setOrder(data);
        setLoading(false);
    };

    /* -------------------------------------------------------
          CANCEL ITEM
    ------------------------------------------------------- */
    const submitCancelItem = async () => {
        if (!cancelItemId) return toast.error("Item ID missing");

        const res = await protectedPost(
            "order-item/cancel/",
            {
                order_item_id: cancelItemId,
                refund_method: cancelRefundMethod,
            },
            navigate
        );

        if (res) {
            toast.success("Item cancelled successfully");
            setCancelModalOpen(false);
            setCancelItemId(null);
            loadOrder();
        }
    };

    /* -------------------------------------------------------
          RETURN ITEM
    ------------------------------------------------------- */
    const submitReturnItem = async () => {
        if (!returnItemId) return toast.error("Item ID missing");
        if (!returnReason.trim()) return toast.error("Enter reason");

        const formData = new FormData();
        formData.append("order_item_id", String(returnItemId));
        formData.append("reason", returnReason);
        formData.append("refund_method", returnRefundMethod);

        if (returnImages.image_1)
            formData.append("image_1", returnImages.image_1);
        if (returnImages.image_2)
            formData.append("image_2", returnImages.image_2);
        if (returnImages.image_3)
            formData.append("image_3", returnImages.image_3);

        const res = await protectedPostMultipart(
            "order-item/return/",
            formData,
            navigate
        );

        if (res) {
            toast.success("Return request created");
            setReturnModalOpen(false);
            setReturnItemId(null);
            setReturnReason("");
            setReturnImages({ image_1: null, image_2: null, image_3: null });
            loadOrder();
        }
    };

    /* -------------------------------------------------------
          RATING (REVIEW)
    ------------------------------------------------------- */
    const submitReview = async () => {
        if (!reviewProductId) return toast.error("Product missing");
        if (!reviewRating) return toast.error("Please select a rating");

        const body = {
            product_id: reviewProductId,
            rating: reviewRating,
            comment: reviewComment,
        };

        console.log("Submitting review:", body);

        const res = await protectedPost(
            "reviews/add/",  // correct backend endpoint
            body,
            navigate
        );

        if (res) {
            toast.success("Review submitted!");

            // Reset form
            setReviewModalOpen(false);
            setReviewRating(0);
            setReviewComment("");

            // image is ignored since API does not support it now
            setReviewImage(null);

            // refresh the page/order detail
            loadOrder();
        }
    };


    /* -------------------------------------------------------
          PAYMENT RETRY
    ------------------------------------------------------- */


    /* -------------------------------------------------------
    PAYMENT RETRY (CASHFREE)
------------------------------------------------------- */
    const submitRetryPayment = async () => {
        setRetryModalOpen(false);

        try {
            // Step 1 → Ask backend for new Cashfree session
            const res = await protectedPost(
                "payment/retry/",
                { order_id },
                navigate
            );

            if (!res || !res.payment_session_id) {
                toast.error("Retry payment failed");
                return;
            }

            const { payment_session_id } = res;

            // Step 2 → Ensure Cashfree SDK exists
            if (!window.Cashfree) {
                toast.error("Cashfree SDK not loaded");
                return;
            }

            const cashfree = window.Cashfree({ mode: "production" });

            // Step 3 → Open payment modal
            const options = {
                paymentSessionId: payment_session_id,
                redirectTarget: "_modal",
            };

            cashfree.checkout(options).then(async (result: any) => {
                console.log("Cashfree Retry Result:", result);

                // Step 4 → Always verify payment from backend
                const verifyRes = await protectedPost(
                    "payment/verify/",
                    { order_id },
                    navigate
                );

                if (verifyRes?.status === "success") {
                    toast.success("Payment Completed!");
                } else {
                    toast.error("Payment Failed");
                }

                loadOrder();
            });
        } catch (error) {
            console.error("Retry error:", error);
            toast.error("Retry payment failed");
        }
    };



    /* -------------------------------------------------------
          TRACKING TIMELINE
    ------------------------------------------------------- */
    const stepOrder = [
        "pending",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
    ];

    const stepLabels: any = {
        pending: "Order Placed",
        processing: "Processing",
        shipped: "Shipped",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
    };

    const stepIcons: any = {
        pending: Clock3,
        processing: Truck,
        shipped: Truck,
        out_for_delivery: PackageCheck,
        delivered: CheckCircle,
    };

    const currentStepIndex = stepOrder.indexOf(order?.status || "pending");

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );

    if (!order)
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Order not found
            </div>
        );

    return (
        <div className="min-h-screen py-10 px-4 text-white">
            {/* BACK BUTTON */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white/70 hover:text-[#C8A962]"
            >
                <ArrowLeft /> Back
            </button>

            <h1 className="text-3xl font-bold mt-4 mb-6">
                Order #{order.order_id}
            </h1>

            {/* -------------------------------------------------------
          PAYMENT RETRY BANNER
      ------------------------------------------------------- */}
            {order.status === "pending" &&
                order.payment?.payment_status !== "success" && (
                    <div className="bg-red-700/40 border border-red-500 p-4 rounded-xl mb-6">
                        <p className="text-red-300 font-semibold mb-2">
                            Payment Failed / Not Completed
                        </p>
                        <button
                            onClick={() => setRetryModalOpen(true)}
                            className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold"
                        >
                            Retry Payment
                        </button>
                    </div>
                )}

            {/* -------------------------------------------------------
          TRACKING TIMELINE
      ------------------------------------------------------- */}
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-md mb-6">
                <h2 className="text-xl font-bold mb-4">Order Tracking</h2>

                <div className="relative">
                    <div className="absolute left-[14px] top-6 w-1 h-[calc(100%-40px)] bg-white/20"></div>

                    {stepOrder.map((status, index) => {
                        const Icon = stepIcons[status];
                        const isActive = index <= currentStepIndex;

                        return (
                            <div key={status} className="flex items-start gap-4 mb-6">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-[#C8A962]" : "bg-gray-600"
                                        }`}
                                >
                                    <Icon className="w-5 h-5 text-black" />
                                </div>

                                <div>
                                    <p
                                        className={`text-lg font-bold ${isActive ? "text-[#C8A962]" : "text-white/50"
                                            }`}
                                    >
                                        {stepLabels[status]}
                                    </p>

                                    {status === "pending" && (
                                        <p className="text-white/70 text-sm">
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    )}

                                    {status === "delivered" &&
                                        order.shipping?.delivered_at && (
                                            <p className="text-white/70 text-sm">
                                                {new Date(
                                                    order.shipping.delivered_at
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* -------------------------------------------------------
          INVOICE DOWNLOAD
      ------------------------------------------------------- */}
            {["shipped", "delivered"].includes(order.status) &&
                order.invoice && (
                    <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md mb-6">
                        <h2 className="text-xl font-bold mb-3">Invoice</h2>

                        <p className="text-white/70 mb-3">
                            Your invoice is ready to download.
                        </p>

                        <a
                            href={order.invoice}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-block bg-[#C8A962] text-black px-5 py-2 rounded-lg font-semibold hover:bg-[#d8b774]"
                        >
                            Download Invoice (PDF)
                        </a>
                    </div>
                )}

            {/* -------------------------------------------------------
          ITEMS SECTION
      ------------------------------------------------------- */}
            <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md mb-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>

                {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 mb-6">
                        <img
                            src={item.product_details.image}
                            className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                            <p className="font-bold">{item.product}</p>
                            <p className="text-white/80">Qty: {item.quantity}</p>

                            {/* Variant */}
                            <p className="text-white/80">
                                {item.variant.color
                                    ? `Color: ${item.variant.color}`
                                    : item.variant.strap_color
                                        ? `Strap: ${item.variant.strap_color}`
                                        : item.variant.frame_color
                                            ? `Frame: ${item.variant.frame_color}`
                                            : ""}
                            </p>

                            <p className="font-semibold mt-1">
                                ₹{Number(item.price).toLocaleString()}
                            </p>

                            {/* CANCEL BUTTON */}
                            {(order.status === "pending" ||
                                order.status === "processing") &&
                                item.status !== "cancelled" &&
                                item.quantity > 0 && (
                                    <button
                                        onClick={() => {
                                            setCancelItemId(item.id);
                                            setCancelModalOpen(true);
                                        }}
                                        className="mt-2 bg-red-700 px-3 py-1 text-sm rounded-lg"
                                    >
                                        Cancel This Item
                                    </button>
                                )}

                            {/* RETURN BUTTON */}
                            {order.status === "delivered" &&
                                item.status !== "returned" &&
                                item.status !== "cancelled" &&
                                item.status !== "retun_requested" && (
                                    <button
                                        onClick={() => {
                                            setReturnItemId(item.id);
                                            setReturnModalOpen(true);
                                        }}
                                        className="mt-2 bg-yellow-400 text-black px-3 py-1 text-sm rounded-lg flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Return This Item
                                    </button>
                                )}

                            {/* ⭐ RATE PRODUCT */}
                            {order.status === "delivered" &&
                                item.status === "delivered" && (
                                    <button
                                        onClick={() => {
                                            setReviewProductId(item.id);
                                            setReviewModalOpen(true);
                                        }}
                                        className="mt-2 bg-green-500 px-3 py-1 text-sm rounded-lg flex items-center gap-1"
                                    >
                                        ⭐ Rate Product
                                    </button>
                                )}

                            {/* STATUS TAGS */}
                            {item.status === "cancelled" && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Cancelled
                                </p>
                            )}

                            {item.status === "returned" && (
                                <p className="text-yellow-400 text-sm mt-1 flex items-center gap-1">
                                    <RotateCcw className="w-4 h-4" /> Returned
                                </p>
                            )}

                            {item.status === "retun_requested" && (
                                <p className="text-blue-400 text-sm mt-1 flex items-center gap-1">
                                    <HelpCircle className="w-4 h-4" /> Return Requested
                                </p>
                            )}

                            {item.status === "return_accepted" && (
                                <p className="text-blue-400 text-sm mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Return Accepted
                                </p>
                            )}

                            {item.status === "refunded" && (
                                <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Refunded
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* -------------------------------------------------------
          ORDER TOTAL
      ------------------------------------------------------- */}
            <div className="bg-white/10 p-5 rounded-xl backdrop-blur-md mb-10">
                <h2 className="text-xl font-bold mb-2">Order Total</h2>
                <p className="text-2xl font-bold">
                    ₹{Number(order.total_price).toLocaleString()}
                </p>
            </div>

            {/* -------------------------------------------------------
          CANCEL MODAL
      ------------------------------------------------------- */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
                    <div className="bg-white/10 p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-3 text-white">
                            Cancel This Item
                        </h2>

                        <label className="text-white">Refund Method</label>
                        <select
                            className="w-full p-2 rounded-lg text-black mt-2"
                            value={cancelRefundMethod}
                            onChange={(e) => setCancelRefundMethod(e.target.value)}
                        >
                            <option value="wallet">Refund to Wallet</option>
                            <option value="original">Refund to Original Method</option>
                        </select>

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setCancelModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border border-white/30 text-white"
                            >
                                Close
                            </button>

                            <button
                                onClick={submitCancelItem}
                                className="flex-1 py-2 rounded-lg bg-red-600 font-semibold"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------------------------------------------
          RETURN MODAL
      ------------------------------------------------------- */}
            {returnModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
                    <div className="bg-white/10 p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-3 text-white">
                            Return This Item
                        </h2>

                        <textarea
                            placeholder="Reason for return..."
                            className="w-full p-3 rounded-lg text-black"
                            rows={3}
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                        />

                        <label className="text-white mt-3 block">Refund Method</label>
                        <select
                            className="w-full p-2 rounded-lg text-black mt-1"
                            value={returnRefundMethod}
                            onChange={(e) => setReturnRefundMethod(e.target.value)}
                        >
                            <option value="wallet">Refund to Wallet</option>
                            <option value="original">Refund to Original</option>
                        </select>

                        <label className="text-white mt-4 block">Upload Images</label>

                        <input
                            type="file"
                            className="text-white mt-2"
                            onChange={(e) =>
                                setReturnImages({
                                    ...returnImages,
                                    image_1: e.target.files?.[0] || null,
                                })
                            }
                        />

                        <input
                            type="file"
                            className="text-white mt-2"
                            onChange={(e) =>
                                setReturnImages({
                                    ...returnImages,
                                    image_2: e.target.files?.[0] || null,
                                })
                            }
                        />

                        <input
                            type="file"
                            className="text-white mt-2"
                            onChange={(e) =>
                                setReturnImages({
                                    ...returnImages,
                                    image_3: e.target.files?.[0] || null,
                                })
                            }
                        />

                        <div className="flex gap-4 mt-5">
                            <button
                                onClick={() => setReturnModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border border-white/30 text-white"
                            >
                                Close
                            </button>

                            <button
                                onClick={submitReturnItem}
                                className="flex-1 py-2 rounded-lg bg-yellow-400 text-black font-semibold"
                            >
                                Submit Return
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------------------------------------------
          PAYMENT RETRY MODAL
      ------------------------------------------------------- */}
            {retryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
                    <div className="bg-white/10 p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-3 text-white">
                            Retry Payment
                        </h2>

                        <p className="text-white/80 mb-4">
                            Complete payment for this order to continue.
                        </p>

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setRetryModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border border-white/30 text-white"
                            >
                                Close
                            </button>

                            <button
                                onClick={submitRetryPayment}
                                className="flex-1 py-2 rounded-lg bg-yellow-400 text-black font-semibold"
                            >
                                Retry Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------------------------------------------
          ⭐ REVIEW MODAL
      ------------------------------------------------------- */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/10 p-6 rounded-xl w-full max-w-md text-white">

                        <h2 className="text-xl font-bold mb-3">Rate this Product</h2>

                        {/* Rating Stars */}
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    className={`text-3xl cursor-pointer ${star <= reviewRating ? "text-yellow-400" : "text-gray-500"
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <textarea
                            placeholder="Write your review..."
                            className="w-full p-3 rounded-lg text-black"
                            rows={3}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                        ></textarea>

                        <label className="block mt-3">Upload Image (optional)</label>
                        <input
                            type="file"
                            className="text-white mt-2"
                            onChange={(e) => setReviewImage(e.target.files?.[0] || null)}
                        />

                        <div className="flex gap-4 mt-5">
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="flex-1 py-2 rounded-lg border border-white/30 text-white"
                            >
                                Close
                            </button>

                            <button
                                onClick={submitReview}
                                className="flex-1 py-2 rounded-lg bg-green-500 text-black font-semibold"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
