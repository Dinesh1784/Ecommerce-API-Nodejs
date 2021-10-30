const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      message: "The user is not authorized",
    });
  }
  if (err.name === "ValidationError") {
    return res.status(401).json({
      message: err,
    });
  }
  if (err.name === "CastError") {
    return res.status(401).json({
      message: "Invalid ID",
    });
  }
  if (err.code === 11000) {
    return res.status(401).json({
      message: "Duplicate keys detected",
    });
  }

  return res.status(err.statusCode).json({
    status: err.name,
    message: err.message,
  });
};
module.exports = errorHandler;
