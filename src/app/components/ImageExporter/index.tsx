'use client';

import { useState, useEffect } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";

import Link from "next/link";
import Image from "next/image";

import { uploadFile } from "@/app/lib/upload-action";

import { useFormState, useFormStatus } from "react-dom";

import InteractTextWithImage from "../InteractTextWithImage";

const initialState = {
    message: ""
};

const ImageExporter = () => {
    const { pending } = useFormStatus();
    const [state, formAction] = useFormState(uploadFile, initialState);

    const DefImageFile = {
        file:null,
        preview: null
    };

    const [ imageFile, setImageFile ] = useState(DefImageFile);
    const [ isLoading, setIsLoading ] = useState(false);

    useEffect(() => {
        console.log('in useEffect/ state>> ', state)
        if(state?.message) {
            setIsLoading(false);
            setImageFile(DefImageFile);

            setTimeout(() => {
                alert(state.message);
            }, 0);
        }
        
    }, [state]);

    const uploadHandler = (e:any) => {
        console.log(e.target.files[0])

        const file = e.target.files[0];

        if(!['image/png', 'image/jpeg','image/jpg'].includes(file.type)) {
            alert('Invalid File Type!')
            setImageFile(DefImageFile);
        } else if(Math.round((file.size / 1024)) >= 1024) {
            alert('Invalid File Size! \n Image file size must be less than 1MB.')
            setImageFile(DefImageFile);
        }
        else if(/[\x7B-\xFF]+/g.test(file.name)) {
            alert('Invalid File Name! Image file name can accept A-to-Z, 0-to-9, hyphen(-) and underscore(_) only.')
            setImageFile(DefImageFile);
        } else {
            const selectedFiles = e.target.files;
            
            if (selectedFiles && selectedFiles[0]) {
                const numberOfFiles = selectedFiles.length;
                
                for (let i = 0; i < numberOfFiles; i++) {
                    const reader = new FileReader();

                    reader.onload = (e: any) => {
                        setImageFile({
                            file: file,
                            preview: e.target.result
                        });
                    };
                    
                    reader.readAsDataURL(selectedFiles[i]);
                }
            }
        }
    }

    const submitHandler = () => {
        console.log('entered submitHandler...')
        setIsLoading(true);
    }

    return (
        <div className="mx-auto max-w-7xl">
            <Breadcrumb pageName="Image Export" />

            {/* <!-- File upload --> */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        File upload
                    </h3>   
                </div>
                <div className="flex flex-col gap-5.5 p-6.5">
                    <form action={formAction} className="flex flex-col gap-4">
                        <label 
                        htmlFor="uploaderid" 
                        className="inline-flex items-center justify-center gap-2.5 rounded-md bg-cyan-500 text-white px-10 py-2 text-center font-medium hover:bg-cyan-600 lg:px-8 xl:px-10 w-1/3">
                            <span>
                                <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth="1.5" 
                                stroke="currentColor" 
                                className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                </svg>
                            </span>
                            Image File Upload

                            <input
                            id="uploaderid"
                            type="file"
                            accept=".png, .jpg, .jpeg" 
                            style={{display: 'none'}}
                            onChange={e => uploadHandler(e)} 
                            name="img-file" />
                        </label>

                        <div style={{marginTop:'10px', display:'none'}}>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Uploaded Image Preview
                            </label>
                            
                            <Image
                            src={imageFile && imageFile.preview || "/images/cover/no-image.png"}
                            alt="profile cover"
                            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
                            width={970}
                            height={260}
                            style={{
                                width: "auto",
                                height: "auto",
                            }}
                            priority={true}
                            />
                        </div>
                        
                        {/* <button
                        type="submit"
                        className="inline-block rounded-md bg-meta-3 w-40 px-6 pb-2 pt-2.5 shadow-primary-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 disabled:opacity-70 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                        onClick={submitHandler}>
                            {
                                isLoading && (
                                <div
                                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                role="status"></div>
                                )
                            }                                    
                            <span style={{marginLeft:'5px'}}>Submit</span>
                        </button> */}
                    </form>
                </div>

                {/* {
                    imageFile.preview && <InteractTextWithImage imagesrc={imageFile.preview} />
                } */}
                
            </div>
        </div>
    )
}

export default ImageExporter;