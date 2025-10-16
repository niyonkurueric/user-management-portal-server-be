import Joi from "joi";

// Schema for validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().max(100).allow(null, "").optional(),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details.map((d) => d.message),
    });
  }

  next();
};
