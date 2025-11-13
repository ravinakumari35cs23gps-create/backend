/**
 * Standard API Response Format
 */
class ApiResponse {
  static success(data, message = 'Success', meta = {}) {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static error(message, code = 'ERROR', details = null, statusCode = 500) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        statusCode,
      },
    };
  }

  static paginated(data, page, limit, total) {
    return {
      success: true,
      data,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };
  }
}

module.exports = ApiResponse;
