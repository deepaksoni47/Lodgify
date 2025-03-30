const Joi = require("joi");
module.exports.listingSchema = Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.alternatives().try(
            Joi.string().uri().allow(null, ""), // Allow empty or image URL
            Joi.object({
                filename: Joi.string().optional(),
                url: Joi.string().uri().required()
            }).optional()
        ).optional()

});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
});