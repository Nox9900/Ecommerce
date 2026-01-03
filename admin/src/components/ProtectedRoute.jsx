import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import PageLoader from "./PageLoader";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return <PageLoader />;

    const isAdmin = user?.emailAddresses?.[0]?.emailAddress === "yhandesir01@gmail.com";
    const role = user?.publicMetadata?.role || (isAdmin ? "admin" : "customer");

    if (!allowedRoles.includes(role)) {
        // Redirect to the role's default entry point if they hit an unauthorized route
        if (role === "admin") return <Navigate to="/dashboard" />;
        if (role === "vendor") return <Navigate to="/vendor-dashboard" />;
        return <Navigate to="/vendor-onboarding" />;
    }

    return children;
};

export default ProtectedRoute;
