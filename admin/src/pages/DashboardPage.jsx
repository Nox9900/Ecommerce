import { useQuery } from "@tanstack/react-query";
import { orderApi, statsApi } from "../lib/api";
import { DollarSignIcon, PackageIcon, ShoppingBagIcon, UsersIcon } from "lucide-react";
import { capitalizeText, formatDate, getOrderStatusBadge } from "../lib/utils";

function DashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  // it would be better to send the last 5 items from the api, instead of slicing it here
  // but we're just keeping it simple here...
  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  const statsCards = [
    {
      name: "Total Revenue",
      value: statsLoading ? "..." : `$${statsData?.totalRevenue?.toFixed(2) || 0}`,
      icon: <DollarSignIcon className="size-8" aria-hidden="true" />,
      ariaLabel: `Total Revenue: ${statsData?.totalRevenue?.toFixed(2) || 0} dollars`,
    },
    {
      name: "Total Orders",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-8" aria-hidden="true" />,
      ariaLabel: `Total Orders: ${statsData?.totalOrders || 0}`,
    },
    {
      name: "Total Customers",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UsersIcon className="size-8" aria-hidden="true" />,
      ariaLabel: `Total Customers: ${statsData?.totalCustomers || 0}`,
    },
    {
      name: "Total Products",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <PackageIcon className="size-8" aria-hidden="true" />,
      ariaLabel: `Total Products: ${statsData?.totalProducts || 0}`,
    },
    {
      name: "Pending Vendors",
      value: statsLoading ? "..." : statsData?.pendingVendors || 0,
      icon: <UsersIcon className="size-8 text-warning" aria-hidden="true" />,
      highlight: (statsData?.pendingVendors || 0) > 0,
      ariaLabel: `Pending Vendors: ${statsData?.pendingVendors || 0}`,
    },
  ];

  return (
    <div className="space-y-6" role="main" aria-label="Dashboard Overview">
      {/* STATS */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100" role="region" aria-label="Quick Statistics">
        {statsCards.map((stat) => (
          <div key={stat.name} className={`stat ${stat.highlight ? "bg-warning/10" : ""}`} aria-label={stat.ariaLabel}>
            <div className={`stat-figure ${stat.highlight ? "text-warning" : "text-primary"}`}>
              {stat.icon}
            </div>
            <div className="stat-title font-semibold">{stat.name}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="card bg-base-100 shadow-xl" role="region" aria-label="Recent Orders List">
        <div className="card-body">
          <h2 className="card-title">Recent Orders</h2>

          {ordersLoading ? (
            <div className="flex justify-center py-8" aria-busy="true" aria-label="Loading recent orders">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table" aria-label="Table of recent orders">
                <thead>
                  <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Items</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="font-medium" aria-label={`Order ID: ${order._id.slice(-8).toUpperCase()}`}>#{order._id.slice(-8).toUpperCase()}</span>
                      </td>

                      <td>
                        <div>
                          <div className="font-medium">{order.shippingAddress.fullName}</div>
                          <div className="text-sm opacity-60">
                            {order.orderItems.length} item(s)
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm">
                          {order.orderItems[0]?.name}
                          {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                        </div>
                      </td>

                      <td>
                        <span className="font-semibold" aria-label={`Total Price: ${order.totalPrice.toFixed(2)} dollars`}>${order.totalPrice.toFixed(2)}</span>
                      </td>

                      <td>
                        <div className={`badge ${getOrderStatusBadge(order.status)}`} role="status">
                          {capitalizeText(order.status)}
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
