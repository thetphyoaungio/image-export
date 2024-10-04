//import { Schema, model } from "mongoose";
import mongoose from "mongoose";



const ImageExportSchema = new mongoose.Schema(
    {
        imageLink: {
            type: String,
            required: true
        }
    }, 
    { timestamps: true}
);

export default mongoose.models.ImageExport || mongoose.model('ImageExport', ImageExportSchema);