import { useState } from "react";
import { vendorApi } from "../../lib/api";
import toast from "react-hot-toast";
import { StoreIcon, SendIcon } from "lucide-react";

function VendorOnboarding() {
    const [formData, setFormData] = useState({
        shopName: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await vendorApi.register(formData);
            toast.success("Registration submitted successfully!");
            setSubmitted(true);
        } catch (error) {
            console.error("Error registering vendor:", error);
            toast.error(error.response?.data?.message || "Failed to submit registration");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="size-20 bg-success/20 text-success rounded-full flex items-center justify-center">
                    <SendIcon className="size-10" />
                </div>
                <h2 className="text-3xl font-bold">Registration Received!</h2>
                <p className="max-w-md opacity-70">
                    Your vendor application has been sent to the administrators for review.
                    You will receive access to your portal once approved.
                </p>
                <button onClick={() => window.location.href = "/dashboard"} className="btn btn-primary mt-4">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="card bg-base-100 shadow-2xl border border-base-300">
                <div className="card-body gap-6">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-primary text-primary-content rounded-xl flex items-center justify-center">
                            <StoreIcon className="size-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Become a Vendor</h2>
                            <p className="text-sm opacity-60">Start selling your products on our platform</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Shop Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Unique name for your shop"
                                className="input input-bordered focus:input-primary"
                                value={formData.shopName}
                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Shop Description</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-32 focus:textarea-primary"
                                placeholder="Tell us about what you sell..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="card-actions mt-6">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block gap-2"
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner"></span> : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default VendorOnboarding;
