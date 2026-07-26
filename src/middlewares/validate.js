// middleware/validate.js

const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req[source]);

      if (!result.success) {
        const errors = {};

        result.error.issues.forEach((issue) => {
          const field = issue.path.join(".");
          errors[field] = issue.message;
        });

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }


      req[source] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validate;