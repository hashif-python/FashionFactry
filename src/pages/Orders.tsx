import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { protectedGet } from "../lib/protectedApi";
import { ArrowRight } from "lucide-react";

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await protectedGet("orders/", navigate);
    if (data) setOrders(data);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl mb-4">No Orders Found</h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-[#C8A962] text-black rounded-lg"
        >
          Shop Now
        </button>
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.order_id}
            className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold">Order #{order.order_id}</p>
                <p className="text-white/70 text-sm">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <span
                className={`
                  px-3 py-1 rounded-lg text-sm font-semibold
                  ${order.status === "delivered"
                    ? "bg-green-600"
                    : order.status === "pending"
                      ? "bg-yellow-600"
                      : order.status === "processing"
                        ? "bg-blue-600"
                        : "bg-red-600"
                  }
                `}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-white/80">
                Payment:{" "}
                <span
                  className={`font-semibold ${order.payment_status === "success"
                      ? "text-green-400"
                      : order.payment_status === "failed"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                >
                  {order.payment_status}
                </span>
              </p>

              <p className="text-xl font-bold mt-2">
                ₹{Number(order.total_price).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => navigate(`/orders/${order.order_id}`)}
              className="mt-4 flex items-center gap-2 text-[#C8A962] hover:underline"
            >
              View Details <ArrowRight />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
