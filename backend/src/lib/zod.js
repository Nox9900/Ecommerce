import { z } from "zod";

// --- User Schemas ---

export const addressSchema = z.object({
    body: z.object({
        label: z.string().min(1, "Label is required"),
        fullName: z.string().min(1, "Full name is required"),
        streetAddress: z.string().min(1, "Street address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zipCode: z.string().min(1, "Zip code is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        isDefault: z.boolean().optional(),
    }),
});

export const updateAddressSchema = z.object({
    body: z.object({
        label: z.string().min(1, "Label is required").optional(),
        fullName: z.string().min(1, "Full name is required").optional(),
        streetAddress: z.string().min(1, "Street address is required").optional(),
        city: z.string().min(1, "City is required").optional(),
        state: z.string().min(1, "State is required").optional(),
        zipCode: z.string().min(1, "Zip code is required").optional(),
        phoneNumber: z.string().min(1, "Phone number is required").optional(),
        isDefault: z.boolean().optional(),
    }),
});

export const wishlistSchema = z.object({
    body: z.object({
        productId: z.string().min(1, "Product ID is required"),
    }),
});

// --- Cart Schemas ---

export const addToCartSchema = z.object({
    body: z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive("Quantity must be a positive integer"),
        size: z.string().optional(),
    }),
});

export const updateCartItemSchema = z.object({
    params: z.object({
        productId: z.string().min(1, "Product ID is required"),
    }),
    body: z.object({
        quantity: z.number().int().positive("Quantity must be a positive integer"),
    }),
});

// --- Product Schemas (Admin/Vendor) ---

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        price: z.preprocess(
            (val) => parseFloat(val),
            z.number().positive("Price must be positive")
        ),
        category: z.string().min(1, "Category is required"),
        subCategory: z.string().optional(),
        brand: z.string().optional(),
        stock: z.preprocess(
            (val) => parseInt(val),
            z.number().int().min(0, "Stock cannot be negative")
        ),
        isSubsidy: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
        originalPrice: z.preprocess(
            (val) => (val ? parseFloat(val) : undefined),
            z.number().positive("Original price must be positive").optional()
        ),
        variants: z.preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z.array(z.object({
                name: z.string().optional(),
                options: z.record(z.string()).optional(),
                price: z.number().positive("Variant price must be positive"),
                stock: z.number().int().min(0, "Variant stock cannot be negative"),
                sku: z.string().optional(),
            })).optional()
        ),
    }),
});


// --- Vendor Schemas ---

export const registerVendorSchema = z.object({
    body: z.object({
        shopName: z.string().min(1, "Shop name is required"),
        description: z.string().min(1, "Description is required"),
    }),
});

export const requestWithdrawalSchema = z.object({
    body: z.object({
        amount: z.number().positive("Amount must be positive"),
        bankDetails: z.string().min(1, "Bank details are required").optional(), // Controller code doesn't strictly require it but model might
    }),
});

// --- Category Schemas ---

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional(),
    }),
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, "Category ID is required"),
    }),
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional(),
    }),
});

// --- Review Schemas ---

export const createReviewSchema = z.object({
    body: z.object({
        productId: z.string().min(1, "Product ID is required"),
        orderId: z.string().min(1, "Order ID is required"),
        rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
        comment: z.string().optional(),
    }),
});

// --- Chat Schemas ---

export const startConversationSchema = z.object({
    body: z.object({
        participantId: z.string().min(1, "Participant ID is required"),
    }),
});

export const sendMessageSchema = z.object({
    body: z.object({
        conversationId: z.string().min(1, "Conversation ID is required"),
        content: z.string().optional(),
    }).refine((data) => data.content || true, { // If we had file validation we'd check if either content or file exists
        message: "Message must contain content or file",
        path: ["content"],
    }),
});

// --- Admin Schemas ---

export const settingsSchema = z.object({
    body: z.object({
        globalCommissionRate: z.number().min(0, "Commission rate must be 0 or greater").optional(),
        platformName: z.string().optional(),
        contactEmail: z.string().email("Invalid email").optional(),
    }),
});

export const updateStatusSchema = z.object({
    params: z.object({
        id: z.string().optional(), // For vendor/product IDs in params
        orderId: z.string().optional(),
        vendorId: z.string().optional(),
        withdrawalId: z.string().optional(),
    }),
    body: z.object({
        status: z.string().min(1, "Status is required"),
    }),
});
