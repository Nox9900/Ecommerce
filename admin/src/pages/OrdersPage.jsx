import { PlusIcon, PencilIcon, Trash2Icon, XIcon, ImageIcon, CheckSquare, Square } from "lucide-react";
import { orderApi } from "../lib/api";
import { formatDate } from "../lib/utils";
import { useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function OrdersPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const queryClient = useQueryClient();

  // Bulk operations state
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", q],
    queryFn: () => orderApi.getAll(q),
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: orderApi.bulkUpdateStatus,
    onSuccess: (data) => {
      toast.success(data.message || "Orders updated successfully");
      setSelectedOrders([]);
      setBulkStatus("");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update orders");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: orderApi.bulkDelete,
    onSuccess: (data) => {
      toast.success(data.message || "Orders deleted successfully");
      setSelectedOrders([]);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete orders");
    },
  });

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const orders = ordersData?.orders || [];

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o._id));
    }
  };

  const handleBulkStatusChange = (e) => {
    const status = e.target.value;
    if (!status) return;

    if (window.confirm(`Are you sure you want to update status to ${status} for ${selectedOrders.length} order(s)?`)) {
      bulkUpdateStatusMutation.mutate({ orderIds: selectedOrders, status });
    } else {
      setBulkStatus("");
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
      bulkDeleteMutation.mutate(selectedOrders);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-base-content/70">Manage customer orders</p>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedOrders.length > 0 && (
        <div className="alert bg-primary/10 border-primary/20">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="btn btn-sm btn-ghost gap-2"
              >
                {selectedOrders.length === orders.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                {selectedOrders.length === orders.length ? "Deselect All" : "Select All"}
              </button>
              <span className="font-medium">
                {selectedOrders.length} order(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="select select-sm select-bordered w-full max-w-xs"
                value={bulkStatus}
                onChange={handleBulkStatusChange}
                disabled={bulkUpdateStatusMutation.isPending}
              >
                <option value="">Update Status...</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>

              <button
                onClick={handleBulkDelete}
                className="btn btn-sm btn-error gap-2"
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Trash2Icon className="w-4 h-4" />
                    Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">No orders yet</p>
              <p className="text-sm">Orders will appear here once customers make purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <label>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onChange={handleSelectAll}
                        />
                      </label>
                    </th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    return (
                      <tr key={order._id}>
                        <td>
                          <label>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedOrders.includes(order._id)}
                              onChange={() => handleSelectOrder(order._id)}
                            />
                          </label>
                        </td>
                        <td>
                          <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                        </td>

                        <td>
                          <div className="font-medium">{order.shippingAddress.fullName}</div>
                          <div className="text-sm opacity-60">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium">{totalQuantity} items</div>
                          <div className="text-sm opacity-60">
                            {order.orderItems[0]?.name}
                            {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                          </div>
                        </td>

                        <td>
                          <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                        </td>

                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="select select-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>

                        <td>
                          <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default OrdersPage;
