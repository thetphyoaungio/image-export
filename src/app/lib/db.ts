import { DB } from '@/app/lib/keys';

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(DB);
        console.log(`Database connected ::: ${dbConnection.connection.host}`);
    } catch (error:any) {
        console.error(`DB Connection Error::: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;