'use server';

import { revalidatePath } from 'next/cache';
import connectDB from "@/app/lib/db";
import ExportImage from '@/app/lib/models/image-export';

export async function getImages() {
    try {
        await connectDB();

        let tmp:any = await ExportImage.find({},{__v:0});
        console.log(tmp)

        const result = await tmp.map((x:any) => ({
            _id: x._id,
            imageLink: x.imageLink,
            createdAt: x.createdAt && new Date(x.createdAt.toString()).toLocaleString(),
            updatedAt: x.updatedAt && new Date(x.updatedAt.toString()).toLocaleString(),
        }));

        revalidatePath('/exportedimages');

        return {
            status: 200,
            message: 'Success in getting images.',
            data: result||[]
        }

    } catch(error:any) {
        return {
            status: error?.status || 500,
            message: error?.message || 'Something wrong!',
            data:null
        }
    }
}

export async function getImagesByPagin(page:number, limit:number) {
    try {
        await connectDB();

        const query$ = [
            {
                "$facet":{
                    "data":[{'$skip': (+page - 1) * +limit}, {'$limit': +limit}, {"$project":{"__v":0}}],
                    "total":[{'$count':'imageLink'}]
                }
            }
        ];

        const result = await ExportImage.aggregate(query$);

        if(result.length > 0 && result[0].data.length > 0 && result[0].total.length > 0) {
            if((+page - 1) * +limit >= result[0].total[0]['imageLink']) {
                return {
                    status: 404,
                    message: 'Your Page Number is Overflow',
                    data:null
                }
            }

            const result$ = {
                data: result[0].data, 
                total: result[0].total[0]['imageLink']
            };

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

    } catch(error:any) {
        return {
            status: error?.status || 500,
            message: error?.message || 'Something wrong!',
            data:null
        }
    }
}