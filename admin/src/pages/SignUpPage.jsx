import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
    return (
        <div className="h-screen hero">
            <SignUp signInUrl="/login" />
        </div>
    );
}

export default SignUpPage;
