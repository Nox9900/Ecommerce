import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useUser, UserButton } from "@clerk/clerk-react";
import {
  SearchIcon,
  Loader2Icon,
  ClipboardListIcon,
  HomeIcon,
  PanelLeftIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  UsersIcon,
  StoreIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  BanknoteIcon,
  MessageSquare,
} from "lucide-react";

// eslint-disable-next-line
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="size-5" /> },
  { name: "Products", path: "/products", icon: <ShoppingBagIcon className="size-5" /> },
  { name: "Orders", path: "/orders", icon: <ClipboardListIcon className="size-5" /> },
  { name: "Customers", path: "/customers", icon: <UsersIcon className="size-5" /> },
  { name: "Vendors", path: "/vendors", icon: <StoreIcon className="size-5" /> },
  { name: "Payouts", path: "/withdrawals", icon: <BanknoteIcon className="size-5" /> },
  { name: "Settings", path: "/global-settings", icon: <SettingsIcon className="size-5" /> },
  { name: "Mobile App", path: "/mobile-app", icon: <SmartphoneIcon className="size-5" /> },
  {
    name: "Vendor Application",
    path: "/vendor-onboarding",
    icon: <StoreIcon className="size-5" />,
  },
  {
    name: "Vendor Portal",
    path: "/vendor-dashboard",
    icon: <LayoutDashboardIcon className="size-5" />,
  },
  {
    name: "My Products",
    path: "/vendor-products",
    icon: <ShoppingBagIcon className="size-5" />,
  },
  {
    name: "My Shops",
    path: "/vendor-shops",
    icon: <StoreIcon className="size-5" />,
  },
  {
    name: "Chat",
    path: "/chat",
    icon: <MessageSquare className="size-5" />,
  },
];

const SEARCHABLE_ROUTES = [
  "/products",
  "/orders",
  "/customers",
  "/vendors",
  "/withdrawals",
  "/vendor-products",
  "/vendor-shops",
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const isSearchablePage = SEARCHABLE_ROUTES.includes(location.pathname);

  // Sync internal state with URL parameter (for back/forward navigation)
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Debounce search query to URL
  useEffect(() => {
    if (!isSearchablePage) return;

    const timer = setTimeout(() => {
      const q = searchQuery.trim();
      setSearchParams((prev) => {
        if (q) {
          prev.set("q", q);
        } else {
          prev.delete("q");
        }
        return prev;
      }, { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchablePage, setSearchParams]);

  return (
    <div className="navbar w-full bg-base-300 z-50 px-4">
      <label htmlFor="my-drawer" className="btn btn-square btn-ghost" aria-label="open sidebar">
        <PanelLeftIcon className="size-5" />
      </label>

      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-xl font-bold hidden xl:block min-w-max">
          {NAVIGATION.find((item) => item.path === location.pathname)?.name || "Dashboard"}
        </h1>

        {isSearchablePage && (
          <div className="relative flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search in ${NAVIGATION.find(n => n.path === location.pathname)?.name?.toLowerCase() || 'this page'}...`}
                className="input input-bordered w-full pl-10 h-10 bg-base-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon className="size-4 opacity-50" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pl-2">
        <UserButton afterSignOutUrl="/login" />
      </div>
    </div>
  );
}

export default Navbar;
