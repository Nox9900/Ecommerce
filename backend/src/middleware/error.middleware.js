import { ENV } from "../config/env.js";

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    let value = "";
    if (err.errmsg && typeof err.errmsg === "string") {
        const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
        value = match ? match[0] : "unknown";
    } else if (err.keyValue) {
        value = Object.values(err.keyValue)[0];
    } else {
        value = "unknown";
    }
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error("ERROR 💥", err);
        // TEMPORARY DEBUGGING: Send error details to client
        res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
            devMessage: err.message,
            stack: err.stack,
        });
    }
};

export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (ENV.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (ENV.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError") error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    } else {
        // Default fallback
        sendErrorDev(err, res);
    }
};
