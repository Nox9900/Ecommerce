import { UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router";

import {
  ClipboardListIcon,
  HomeIcon,
  PanelLeftIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  UsersIcon,
  StoreIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  MessageSquare,
  BanknoteIcon,
} from "lucide-react";

// eslint-disable-next-line
export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="size-5" /> },
  { name: "Products", path: "/products", icon: <ShoppingBagIcon className="size-5" /> },
  { name: "Orders", path: "/orders", icon: <ClipboardListIcon className="size-5" /> },
  { name: "Customers", path: "/customers", icon: <UsersIcon className="size-5" /> },
  { name: "Vendors", path: "/vendors", icon: <StoreIcon className="size-5" /> },
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
    name: "Chat",
    path: "/chat",
    icon: <MessageSquare className="size-5" />,
  },
];

function Navbar() {
  const location = useLocation();

  return (
    <div className="navbar w-full bg-base-300">
      <label htmlFor="my-drawer" className="btn btn-square btn-ghost" aria-label="open sidebar">
        <PanelLeftIcon className="size-5" />
      </label>

      <div className="flex-1 px-4">
        <h1 className="text-xl font-bold">
          {NAVIGATION.find((item) => item.path === location.pathname)?.name || "Dashboard"}
        </h1>
      </div>

      <div className="mr-5">
        <UserButton />
      </div>
    </div>
  );
}

export default Navbar;
