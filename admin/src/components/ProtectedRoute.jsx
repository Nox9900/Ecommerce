import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import PageLoader from "./PageLoader";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return <PageLoader />;

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const isEmailAdmin = user?.emailAddresses?.[0]?.emailAddress === adminEmail;
    const role = isEmailAdmin ? "admin" : (user?.publicMetadata?.role || "customer");

    if (!allowedRoles.includes(role)) {
        // Redirect to the role's default entry point if they hit an unauthorized route
        if (role === "admin") return <Navigate to="/dashboard" />;
        if (role === "vendor") return <Navigate to="/vendor-dashboard" />;
        return <Navigate to="/vendor-onboarding" />;
    }

    return children;
};

export default ProtectedRoute;
