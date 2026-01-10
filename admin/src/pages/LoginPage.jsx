import { SignIn } from "@clerk/clerk-react";

function LoginPage() {
  return (
    <div className="h-screen hero">
      <SignIn signUpUrl="/signup" />
    </div>
  );
}
export default LoginPage;
