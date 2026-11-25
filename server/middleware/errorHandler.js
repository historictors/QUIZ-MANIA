const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    if (field === 'rollNumber') {
      message = 'Roll number is already registered';
    } else if (field === 'email') {
      message = 'Email is already registered';
    } else if (field === 'name') {
      message = 'Department name already exists';
    } else if (field === 'code') {
      message = 'Department code already exists';
    } else {
      message = `Duplicate value entered for ${field}`;
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
