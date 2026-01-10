import { useUser } from "@clerk/clerk-react";
import { ShoppingBagIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import { NAVIGATION } from "./Navbar";
import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../lib/api";

function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  const { data: statsData } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: statsApi.getDashboard,
    enabled: !!user, // Only fetch if user is logged in
  });

  const pendingCount = statsData?.pendingVendors || 0;

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === adminEmail;
  // If they are an admin by email, they are ALWAYS admin. Otherwise, check metadata.
  const role = isAdmin ? "admin" : (user?.publicMetadata?.role || "customer");

  return (
    <div className="drawer-side is-drawer-close:overflow-visible">
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

      <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
        <div className="p-4 w-full">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBagIcon className="w-6 h-6 text-primary-content" />
            </div>
            <span className="text-xl font-bold is-drawer-close:hidden capitalize">
              {role === "admin" ? "Super Admin" : role === "vendor" ? "Vendor Portal" : "Customer"}
            </span>
          </div>
        </div>

        <ul className="menu w-full grow flex flex-col gap-2">
          {NAVIGATION.filter((item) => {
            // Define which pages each role can see
            const adminPages = [
              "/dashboard",
              "/products",
              "/orders",
              "/customers",
              "/vendors",
              "/withdrawals",
              "/global-settings",
              "/mobile-app",
              "/chat",
            ];
            const vendorPages = ["/vendor-dashboard", "/vendor-products", "/vendor-shops", "/chat"];
            const customerPages = ["/vendor-onboarding"];

            if (role === "admin") return adminPages.includes(item.path);
            if (role === "vendor") return vendorPages.includes(item.path);
            return customerPages.includes(item.path);
          }).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right flex justify-between items-center
                    ${isActive ? "bg-primary text-primary-content" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="is-drawer-close:hidden">{item.name}</span>
                  </div>

                  {item.path === "/vendors" && pendingCount > 0 && (
                    <span className="badge badge-error badge-sm is-drawer-close:hidden">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="p-4 w-full">
          <div className="flex items-center gap-3">
            <div className="avatar shrink-0">
              <img src={user?.imageUrl} alt={user?.name} className="w-10 h-10 rounded-full" />
            </div>

            <div className="flex-1 min-w-0 is-drawer-close:hidden">
              <p className="text-sm font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs opacity-60 truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
              <div className="badge badge-outline badge-xs opacity-60 mt-1 capitalize">{role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Sidebar;