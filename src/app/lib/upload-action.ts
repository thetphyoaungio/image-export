'use server';

import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs/promises";
import { revalidatePath } from "next/cache";

import {
    AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME
} from "@/app/lib/keys";

import AWS from 'aws-sdk';
const s3 = new AWS.S3({
    accessKeyId:AWS_S3_ACCESS_KEY_ID,
    secretAccessKey:AWS_S3_SECRET_ACCESS_KEY,
});

import connectDB from '@/app/lib/db';
import ExportImage from '@/app/lib/models/image-export';

export async function uploadFile(
    prevState: {
        message: string;
    },
    formData: FormData
) {

    /* console.log('got AWS_S3_ACCESS_KEY_ID>> ',AWS_S3_ACCESS_KEY_ID)
    console.log('got AWS_S3_SECRET_ACCESS_KEY>> ',AWS_S3_SECRET_ACCESS_KEY)
    console.log('got AWS_S3_BUCKET_NAME>> ',AWS_S3_BUCKET_NAME) */

    const file = formData.get("img-file") as File;
    console.log('got img-file>> ', file)

    if(!['image/png', 'image/jpeg','image/jpg'].includes(file.type)) {
        return { message: 'Invalid File Type!' };
    } else if(Math.round((file.size / 1024)) >= 1024) {
        return { message: 'Invalid File Size! \n Image file size must be less than 1MB.' };
    }
    else if(/[\x7B-\xFF]+/g.test(file.name)) {
        return { message: 'Invalid File Name! Image file name can accept A-to-Z, 0-to-9, hyphen(-) and underscore(_) only.' };
    }

    try {
        await connectDB();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        //await fs.writeFile(`public/uploads/${file.name}`, buffer);

        //const blob = new Blob([buffer]);
        const uploadedImg = await s3.upload({
            Bucket: AWS_S3_BUCKET_NAME,
            Key: /* req.file.filename */`${Date.now()}_${file.name}`,
            Body: /* blob */buffer,
            ContentType: /* req.file.mimetype */file.type,
            ACL:'public-read'
        })
        .promise();

        console.log('got uploadedImg after uploading to s3>> ', uploadedImg)

        // To insert image data to DB.
        const newOne = new ExportImage({
            imageLink: uploadedImg?.Location
        });

        const created = await newOne.save();
        /* .then(created => {
            res.status(200).json(createSuccessResponse(200, 'Created Successfully!', {...created._doc}));
        })
        .catch(error => {
            res.status(500).json(createErrorResponse(error));
        }); */
        console.log('got inserted DB result>> ', created)
    
        revalidatePath("/imgexporter");

        return { message: `Image was uploaded and saved to DB successfully!` };
    } catch (e:any) {
        return { message: `Failed to upload image!\nError: ${e.message}` };
    }
}