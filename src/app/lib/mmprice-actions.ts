'use server';

import {
    AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME
} from './keys';

import AWS from 'aws-sdk';
const s3 = new AWS.S3({
    accessKeyId:AWS_S3_ACCESS_KEY_ID,
    secretAccessKey:AWS_S3_SECRET_ACCESS_KEY,
});
import connectDB from '@/app/lib/db';
import PriceSettingModel from '@/app/lib/models/price-setting';

import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';

import mongoose from 'mongoose';

export async function savePriceSetting (
    prices: any,
    prevState: {
        message: string;
    },
    formData: FormData
) {
    const prices$ = JSON.parse(prices);
    //console.log('JSON parsed prices$>> ',prices$)
    const file = formData.get("img-file") as File;
    //console.log('got img-file>> ', file)

    if(!['image/png', 'image/jpeg','image/jpg'].includes(file.type)) {
        return { message: 'Invalid File Type!' };
        
    } /* else if(Math.round((file.size / 1024)) >= 1024) {
        return { message: 'Invalid File Size! \n Image file size must be less than 1MB.' };
    } */
    else if(/[\x7B-\xFF]+/g.test(file.name)) {
        return { message: 'Invalid File Name! Image file name can accept A-to-Z, 0-to-9, hyphen(-) and underscore(_) only.' };
    }

    try {
        await connectDB();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
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
        /* const newOne = new ExportImage({
            imageLink: uploadedImg?.Location
        });

        const created = await newOne.save(); */
        const categoryname = formData.get('category');
        
        console.log('got param prices$ JSON parsed>>> ', prices$)

        const newPriceSetting = new PriceSettingModel({
            category: categoryname,
            imageUrl: uploadedImg?.Location,
            prices: prices$ ? [...prices$] : [],
        });

        const created = await newPriceSetting.save();
        console.log('got inserted DB result>> ', created)
        
        revalidatePath("/mmpricesettinglist");

        return { message: `Price Input Setting was saved to DB successfully!` };
    } catch (e:any) {
        return { message: `Failed to save data!\nError: ${e.message}` };
    }
}

const ITEMS_PER_PAGE = 10;
export async function fetchFilteredPriceSettings(
  query: string,
  currentPage: number,
) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  console.log('got offset>> ',offset)

  try {
    await connectDB();

    const query$ = [
        {
            "$facet":{
                "data":[{'$skip': offset}, {'$limit': +ITEMS_PER_PAGE}, {"$project":{"__v":0}}],
                "total":[{'$count':'imageUrl'}]
            }
        }
    ];

    const result = await PriceSettingModel.aggregate(query$);

    if(result.length > 0 && result[0].data.length > 0 && result[0].total.length > 0) {
            if(offset >= result[0].total[0]['imageUrl']) {
                return {
                    status: 404,
                    message: 'Your Page Number is Overflow',
                    data:null
                }
            }

            const result$ = {
                data: result[0].data, 
                total: result[0].total[0]['imageUrl']
            };
            console.log('got result$ of price setting>> ', result$)

            return {
                status: 200,
                message: 'Success in getting images by pagination.',
                data: result$||null
            }

    } else {
        return {
            status: 200,
            message: 'Success',
            data: {data:[], total:0}
        }
    }

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchPriceSettingPages(query: string) {
    noStore();
  
    try {
        await connectDB();

        const query$ = [
            {
                "$facet":{
                    "total":[{'$count':'imageUrl'}]
                }
            }
        ];

        const result = await PriceSettingModel.aggregate(query$);

        if(result[0].total.length > 0) {
                
                const totalPages = Math.ceil(Number(result[0].total[0]['imageUrl']) / ITEMS_PER_PAGE);
                console.log('got totalPages>> ', totalPages)

                return {
                    status: 200,
                    message: 'Success in getting images by pagination.',
                    data: totalPages||0
                }

        } else {
            return {
                status: 200,
                message: 'Success',
                data: 0
            }
        }
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function deletePriceSetting(id:string|any) {
    noStore();

    try {
        await connectDB();
        
        const result = await PriceSettingModel.findByIdAndDelete(id);
        console.log(`got result after deleting >>`, result)

        /* return JSON.stringify({
            status: 200,
            message: 'Deleted Successfully.',
            data: result
        }); */
    } catch(error:any) {
        console.log(`got err >>`, error.message)

        /* return JSON.stringify({
            status: 500,
            message: `${error.message}`,
            data: null
        }); */
    }

    revalidatePath('/mmpricesettinglist');
    redirect('/mmpricesettinglist');
}

export async function fetchPriceSettingById(id: string) {
    noStore();
  
    try {
        await connectDB();

        const existed:any = await PriceSettingModel.findOne({"_id": id});
        
        if(!existed) {
            return JSON.stringify({
                status:404, 
                message:'Not Found with This ID!',
                data:null
            });
        }

        revalidatePath('/mmpricesettinglist')

        return JSON.stringify({
            status:200, 
            message:'Success',
            data: existed
        });
    } catch (error:any) {
        return JSON.stringify({
            status: 500,
            message: `${error.message}`,
            data: null
        });
    }
}

export async function updatePriceSetting(
    id: string, 
    prices: any, 
    prevState: {
        message: string;
    },
    formData: FormData
) {
    /* const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
     
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Update Invoice.',
        };
    }
     
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
     
    try {
        await sql`
          UPDATE invoices
          SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
          WHERE id = ${id}
        `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }
     
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices'); */
}