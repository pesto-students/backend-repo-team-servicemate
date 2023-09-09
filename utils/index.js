const createResponse = (data, message, error = false) => {
    if (error) {
        return {
            success: false,
            message: message || 'An error occurred',
            error: data || null,
        };
    } else {
        return {
            success: true,
            message: message || 'Operation successful',
            responseData: data || null,
        };
    }
}

module.exports = { createResponse }