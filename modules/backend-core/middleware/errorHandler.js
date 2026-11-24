const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  // Sequelize errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const message =
      err.errors?.[0]?.message || "A record with this value already exists";
    error = { message, statusCode: 409 };
  }

  if (err.name === "SequelizeValidationError") {
    const message =
      (err.errors || []).map((item) => item.message).join(", ") ||
      "Validation failed";
    error = { message, statusCode: 400 };
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    error = {
      message: "Operation violates a related-record constraint",
      statusCode: 409,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
