import mongoose from "mongoose";

const PriceSettingSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        prices: {
            type: [
                {
                    price: {
                        type: String,
                        required: false
                    },
                    x: {
                        type: Number,
                        required: true
                    },
                    y: {
                        type: Number,
                        required: true
                    },
                    id: {
                        type: Number,
                        required: true
                    },
                    image: {
                        type: Object
                    }
                }
            ],
            required: true
        }
    }, 
    { timestamps: true}
);

export default mongoose.models.PriceSetting || mongoose.model('PriceSetting', PriceSettingSchema);