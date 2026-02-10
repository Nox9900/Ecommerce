import { z } from "zod";

export const validate = (schema) => async (req, res, next) => {
    try {
        const dataToValidate = {
            body: req.body,
            query: req.query,
            params: req.params,
        };

        // Parse the data against the schema
        // The schema should be an object with optional body, query, and params keys
        const validatedData = await schema.parseAsync(dataToValidate);

        // Replace req data with validated/transformed data (optional but good practice)
        // Only replacing if the schema specifically validated that part to strictly type it
        if (validatedData.body) req.body = validatedData.body;
        if (validatedData.query) req.query = validatedData.query;
        if (validatedData.params) req.params = validatedData.params;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((e) => {
                const field = e.path[e.path.length - 1];
                return `${field}: ${e.message}`;
            }).join(". ");

            return res.status(400).json({
                message: `Validation Error - ${errorMessages}`,
                errors: error.errors.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};
