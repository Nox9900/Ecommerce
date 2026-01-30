import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { useUser, UserButton } from "@clerk/clerk-react";
import { searchApi, vendorApi } from "../lib/api";
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

function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === adminEmail;
  const role = isAdmin ? "admin" : (user?.publicMetadata?.role || "customer");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = role === "admin"
            ? await searchApi.searchAll(searchQuery)
            : await vendorApi.search(searchQuery);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, role]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar w-full bg-base-300 z-50 px-4">
      <label htmlFor="my-drawer" className="btn btn-square btn-ghost" aria-label="open sidebar">
        <PanelLeftIcon className="size-5" />
      </label>

      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-xl font-bold hidden xl:block min-w-max">
          {NAVIGATION.find((item) => item.path === location.pathname)?.name || "Dashboard"}
        </h1>

        <div className="relative flex-1 max-w-md mx-4" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, orders..."
              className="input input-bordered w-full pl-10 h-10 bg-base-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 2 && setShowDropdown(true)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2Icon className="size-4 animate-spin opacity-50" />
              ) : (
                <SearchIcon className="size-4 opacity-50" />
              )}
            </div>
          </div>

          {showDropdown && searchResults && (
            <div className="absolute top-full left-0 w-full bg-base-100 mt-2 rounded-xl shadow-2xl border border-base-content/10 overflow-hidden max-h-[400px] overflow-y-auto">
              {/* Products Section */}
              {searchResults.products?.length > 0 && (
                <div className="p-2 border-b border-base-content/5">
                  <h3 className="text-[10px] font-bold uppercase opacity-50 px-2 py-1 tracking-wider">Products</h3>
                  {searchResults.products.map(p => (
                    <Link
                      key={p._id}
                      to={role === "admin" ? `/products` : `/vendor-products`}
                      className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <img src={p.images?.[0]} className="size-8 rounded object-cover bg-base-300" />
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[10px] opacity-60 uppercase">{p.brand || 'No brand'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Orders Section */}
              {searchResults.orders?.length > 0 && (
                <div className="p-2 border-b border-base-content/5">
                  <h3 className="text-[10px] font-bold uppercase opacity-50 px-2 py-1 tracking-wider">Orders</h3>
                  {searchResults.orders.map(o => (
                    <Link
                      key={o._id}
                      to={role === "admin" ? `/orders` : `/vendor-dashboard`} // Adjust if vendor-orders exists
                      className="flex flex-col p-2 hover:bg-base-200 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <p className="text-sm font-mono truncate font-bold text-primary">#{o._id.slice(-8).toUpperCase()}</p>
                        <span className="badge badge-outline badge-xs capitalize font-bold">{o.status}</span>
                      </div>
                      <p className="text-xs opacity-60">
                        {o.user?.firstName} {o.user?.lastName}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Customers Section (Admin only) */}
              {role === "admin" && searchResults.customers?.length > 0 && (
                <div className="p-2 border-b border-base-content/5">
                  <h3 className="text-[10px] font-bold uppercase opacity-50 px-2 py-1 tracking-wider">Customers</h3>
                  {searchResults.customers.map(c => (
                    <Link
                      key={c._id}
                      to={`/customers`}
                      className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                        <p className="text-xs opacity-60 truncate">{c.emailAddresses?.[0]?.emailAddress}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Vendors Section (Admin only) */}
              {role === "admin" && searchResults.vendors?.length > 0 && (
                <div className="p-2">
                  <h3 className="text-[10px] font-bold uppercase opacity-50 px-2 py-1 tracking-wider">Vendors</h3>
                  {searchResults.vendors.map(v => (
                    <Link
                      key={v._id}
                      to={`/vendors`}
                      className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex-1 truncate">
                        <p className="text-sm font-medium">{v.shopName}</p>
                        <p className="text-xs opacity-60 truncate">{v.description || 'No description'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!isSearching && Object.values(searchResults).every(arr => arr.length === 0) && (
                <div className="p-8 text-center opacity-50">
                  <p className="text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pl-2">
        <UserButton afterSignOutUrl="/login" />
      </div>
    </div>
  );
}

export default Navbar;
