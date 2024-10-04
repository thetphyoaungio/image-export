'use client';

import { ChangeEvent, useState, useRef, useEffect } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import Image from "next/image";
import clsx from "clsx";
import InteractTextWithImage from "../InteractTextWithImage";
import { useDebouncedCallback } from "use-debounce";
import { SelectGroupTPA } from "@/app/components/SelectGroup/SelectGroupTwo";
import { fontColors, fontSizes, fontWeights, digitCounts } from "@/app/lib/data";
import { updatePriceSetting } from "@/app/lib/mmprice-actions";
import { useFormState } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const initialState:any = {
    message: ""
};

const MMPriceSettingEdit = ({editdata}:{editdata:any}) => {
    console.log('passed got editdata>> ', editdata)

    const noticeStr1 = `NOTICE: Before typing price values,`;
    const noticeStr2 = `Please set X and Y coordinates for each price by clicking on the image where price blank spaces.`;

    const fontColors$ = {title: 'Select Font Color', items: [...fontColors]};
    const fontSizes$ = {title: 'Select Font Size', items: [...fontSizes]};
    const fontWeights$ = {title: 'Select Font Weight(Bold)', items: [...fontWeights]};
    const digitCounts$ = {title: 'Select Digit Count', items: [...digitCounts]};
    
    const [ category, setCategory ] = useState({name: editdata.category});
    const [ imageFile, setImageFile ] = useState({file: null, preview: editdata.imageUrl}); // /images/cover/no-image.png
    const [ prices, setPrices ] = useState([/* { price:'', x:0, y:0, id:1 } */...editdata.prices]);
    const [ myFont, setMyFont ] = useState({
        color: fontColors$.items[0].value, 
        size: fontSizes$.items[0].value, 
        weight: fontWeights$.items[0].value,
        width: digitCounts$.items[0].value,
    });
    const [deletedPrice, setDeletedPrice] = useState<any>();

    const refcanvas:any = useRef();
    const refctx:any = useRef();
    const reftpaimg:any = useRef();

    const updatePriceSettingWithId = updatePriceSetting.bind(null, editdata._id, prices);
    const [state, formAction] = useFormState(updatePriceSettingWithId, initialState);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [inputPrice, setInputPrice] = useState({ price:'', x:0, y:0, id:-1 });

    useEffect(() => {
        //prices.sort((a:any, b:any) => a.id < b.id ? -1 : (a.id > b.id ? 0 : 1))
        //setImageFile({file: null, preview: editdata.imageUrl});

        setTimeout(() => {
            reftpaimg.current = document.getElementById('tpaimg');
            refcanvas.current = document.getElementById('canvaslee');
            
            refcanvas.current.width = reftpaimg.current.width;
            refcanvas.current.crossOrigin = "Anonymous";
            refcanvas.current.height = reftpaimg.current.height;
            
            refctx.current = refcanvas.current?.getContext('2d');
            //var img:HTMLImageElement = new HTMLImageElement;
            reftpaimg.current.onload = function(){
                refctx.current.drawImage(reftpaimg.current, 0, 0);
                // ...and then steps 3 and on
            };
            //refctx.current.drawImage(reftpaimg.current, 0, 0);
            reftpaimg.current.src = editdata.imageUrl; // set this *after* onload

            //refill text
            editdata.prices.forEach((item:any) => { refctx.current.fillText(item.price, item.x, item.y) });
        }, 1000);

        /* var img:HTMLImageElement = new HTMLImageElement;
        img.onload = function(){
        ctx.drawImage( img, 0, 0 );
        // ...and then steps 3 and on
        };
        img.src = "/images/foo.png"; // set this *after* onload */
        
        if(state?.message) {
            alert(state.message);

            router.push('/mmpricesettinglist');
        }

    }, [state]);
    
    const handleCategory = (e:any) => {
        setCategory({name: e.target.value});
    };

    const handleImageUpload = (e:ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            const file:File|any = e.target.files[0];

            if(!['image/png', 'image/jpeg','image/jpg'].includes(file.type)) {
                alert('Invalid File Type!')
                setImageFile({file: null, preview: ''});
            } else if(Math.round((file.size / 1024)) >= 1024) {
                alert('Invalid File Size! \n Image file size must be less than 1MB.')
                setImageFile({file: null, preview: ''});
            }
            else if(/[\x7B-\xFF]+/g.test(file.name)) {
                alert('Invalid File Name! Image file name can accept A-to-Z, 0-to-9, hyphen(-) and underscore(_) only.')
                setImageFile({file: null, preview: ''});
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

                            setTimeout(() => {
                                reftpaimg.current = document.getElementById('tpaimg');
                                refcanvas.current = document.getElementById('canvaslee');
                                
                                refcanvas.current.width = reftpaimg.current.width;
                                refcanvas.current.crossOrigin = "Anonymous";
                                refcanvas.current.height = reftpaimg.current.height;
                                
                                refctx.current = refcanvas.current?.getContext('2d');
                                refctx.current.drawImage(reftpaimg.current, 0, 0);

                                //refill text
                                editdata.prices.forEach((item:any) => { refctx.current.fillText(item.price, item.x, item.y) });
                            }, 100);
                            
                        };
                        
                        reader.readAsDataURL(selectedFiles[i]);
                    }
                }
            }
        } else {
            alert('No File!')
        }
    }

    const handleAddNewPrice = (e:any) => {
        e.preventDefault();

        //check there is deleted ids
        if(deletedPrice) {
            setPrices(ps => ([...ps, { price:'', x:0, y:0, id:deletedPrice.id }]));

            setDeletedPrice((val:any) => ({...val, isNewGenerated: true}));
            
        } else {
            setPrices((prices$:any) => [...prices$, { price:'', x:0, y:0, id:prices.length+1 }]);
        }
    }

    const handleMouseClickOnCanvas = (e:any) => {
        if(prices.findIndex((p:any) => p.x === 0 && p.y === 0) >= 0) {
            const rect = refcanvas.current.getBoundingClientRect();
        
            const xScale = refcanvas.current.width / rect.width;
            const yScale = refcanvas.current.height / rect.height;

            const x = (e.pageX - rect.left) * xScale;
            const y = ((e.pageY - rect.top) * yScale) + 2;

            refctx.current.fillStyle = `${myFont.color}`;
            refctx.current.font = `${myFont.weight} ${myFont.size} Verdana`;

            const w$ = +myFont.width;
            const subs = w$ === 3 ? 3 : (w$ === 4 || w$ === 5 ? 2 : 1);
            const idx = w$ - subs;
            const widthstr = 'xxxxxxxxxx'.slice(0, idx);

            if(deletedPrice && deletedPrice.isNewGenerated) {
                refctx.current.fillText(`P-${deletedPrice.id}${widthstr}`, x, y);

                if(prices.length === 1) {
                    setPrices([{ price:`P-${deletedPrice.id}${widthstr}`, x:x, y:y, id:1 }]);

                } else if(prices.length > 1) {
                    const idx = prices.findIndex((p:any) => p.id === deletedPrice.id);
                    if(idx >= 0) {
                        prices[idx].price = `P-${deletedPrice.id}${widthstr}`;
                        prices[idx].x = x;
                        prices[idx].y = y;
        
                        setPrices([...prices]);
                    }
                }

                setDeletedPrice(null);

            } else {
                refctx.current.fillText(`P-${prices.length}${widthstr}`, x, y);
            
                if(prices.length === 1) {
                    setPrices([{ price:`P-${prices.length}${widthstr}`, x:x, y:y, id:1 }]);
                } else if(prices.length > 1) {
                    prices[prices.length - 1].price = `P-${prices.length}${widthstr}`;
                    prices[prices.length - 1].x = x;
                    prices[prices.length - 1].y = y;

                    setPrices([...prices]);
                }
            }

            const params = new URLSearchParams(searchParams);
            params.append('model', 'true');
            router.replace(`${pathname}?${params.toString()}`);
        } else {
            alert('Please add new price!')
        }
    }
    
    const handlePriceDelete = (e:any, price: any) => {
        e.preventDefault();

        setDeletedPrice({id: price.id, isNewGenerated: false});

        //setPrices([...prices.filter((p:any) => p.id !== price.id)]);

        const filterdprices = [...prices.filter((p:any) => p.id !== price.id)];

        setPrices([...filterdprices]);

        setTimeout(() => {
            reDrawCanvas(filterdprices);
        }, 0);
    }

    const reDrawCanvas = (prices$:Array<any>) => {
        //redraw image
        refctx.current.clearRect(0,0,refcanvas.current.width,refcanvas.current.height);
        refctx.current.drawImage(reftpaimg.current, 0, 0);

        //refill text
        prices$.forEach((item:any) => { refctx.current.fillText(item.price, item.x, item.y) });
    }

    const handleSelectChange = (value$:any, target:string) => {
        setMyFont(vals => ({
            ...vals,
            [target]: value$
        }));
    }

    //edit funcs
    const handlePriceInputChange = useDebouncedCallback((e:any, data:any) => {
        setInputPrice({...data, price: e.target.value});
    }, 850);

    const handlePriceInputOK = (e:any, data:any) => {
        if(data.id === inputPrice.id) {
            const idx = prices.findIndex((p:any) => p.id === data.id);
            console.log('idx , e.target.value>>>> ',idx , e.target.value)
            if(idx>=0) {
                prices[idx].price = inputPrice.price;
                prices[idx].x = data.x;
                prices[idx].y = data.y;

                const updated = [...prices];
        
                setPrices(updated);

                setTimeout(() => {
                    reDrawCanvas(updated);
                }, 0);
            }
        }
        
    };
    //

    return (
        <div className="mx-auto max-w-7xl">
            <Breadcrumb pageName="Price Setting Edit" />

            <div className="flex flex-col gap-9">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="p-6.5">
                        <form action={formAction}>
                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Category Name <span className="text-meta-1">*</span>
                            </label>
                            <input 
                            value={category?.name}
                            type="text"
                            placeholder="Type category name"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            onChange={(e) => handleCategory(e)} 
                            name="category"/>
                        </div>

                        {/* Image with canvas */}
                        <div className="mb-4.5">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Image
                            </label>
                            <div>
                                {/* <label 
                                htmlFor="uploaderid" 
                                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-cyan-500 text-white px-8 py-2 text-center font-medium hover:bg-cyan-600 lg:px-8 xl:px-10 w-full md:w-1/6">
                                    <span>
                                        <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth="1.5" 
                                        stroke="currentColor" 
                                        className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </span>
                                    Upload

                                    <input
                                    id="uploaderid"
                                    type="file"
                                    accept=".png, .jpg, .jpeg" 
                                    style={{display: 'none'}}
                                    onChange={e => handleImageUpload(e)} 
                                    name="img-file" />
                                </label> */}

                                <div className="mt-4.5">
                                    {/* <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                    Preview
                                    </label> */}

                                    <div className="flex flex-col gap-9">
                                        {
                                            imageFile.preview && 
                                            (
                                                <Image
                                                id="tpaimg" 
                                                src={imageFile.preview || '/images/cover/no-image.png'}  
                                                alt="Image 2" 
                                                objectFit="cover" 
                                                layout="fill" 
                                                loading="lazy"
                                                style={{
                                                    display:"none",
                                                }} />
                                            )
                                        }
                                        

                                        <canvas id="canvaslee" width={0} height={0} />
                                        {/*  onClick={handleMouseClickOnCanvas} */}      
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        {
                            imageFile && imageFile.preview && 
                            (
                                <div className="mb-4.5">
                                    <div className="mb-4.5 flex flex-col items-center gap-3 xl:flex-row">
                                        <div className="flex flex-col items-center w-auto">
                                            <label className="block text-sm font-medium text-black dark:text-white">
                                            Price Input
                                            </label>
                                        </div>  
                                        <div className="w-full xl:w-1/6">
                                            <button
                                            className="flex w-auto justify-center rounded bg-primary p-1 px-4 font-medium text-gray hover:bg-opacity-90"
                                            onClick={handleAddNewPrice}>
                                            + New
                                            </button>
                                        </div>
                                    </div>

                                    {/* font properties handler */}
                                    <div className="mb-4.5 flex flex-col items-center bg-slate-100 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 p-3 rounded gap-3 xl:flex-row">
                                        <div className="w-full xl:w-1/4">
                                        <SelectGroupTPA selectdata={fontColors$} selectChange={(e:any)=>handleSelectChange(e, 'color')} />
                                        </div>

                                        <div className="w-full xl:w-1/4">
                                        <SelectGroupTPA selectdata={fontSizes$} selectChange={(e:any)=>handleSelectChange(e, 'size')} />
                                        </div>

                                        <div className="w-full xl:w-1/4">
                                        <SelectGroupTPA selectdata={fontWeights$} selectChange={(e:any)=>handleSelectChange(e, 'weight')} />
                                        </div>

                                        <div className="w-full xl:w-1/4">
                                        <SelectGroupTPA selectdata={digitCounts$} selectChange={(e:any)=>handleSelectChange(e, 'width')} />
                                        </div>
                                    </div>

                                    <p className="my-notice-str">{noticeStr1}</p>
                                    <p className="my-notice-str">{noticeStr2}</p>

                                    {
                                        prices.map((data:any, i:number) => (
                                            <div className="p-3 mb-4.5 flex flex-col items-center gap-3 xl:flex-row rounded bg-slate-100" key={`price-${data.id}`}>
                                                <div className="grow w-full xl:w-5/6">
                                                    {/* <span style={{fontWeight:"bold"}}>{`Price ${data.id}`}</span> */}
                                                    <input 
                                                    defaultValue={data.price}
                                                    type="text"
                                                    placeholder="Type price"
                                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                    onChange={() => handlePriceInputChange}/>

                                                    <div style={{fontSize:'14px'}}>
                                                        <p>X coordinate: <span style={{color:'blue'}}> {data.x}</span></p>
                                                        <p>Y coordinate: <span style={{color:'blue'}}> {data.y}</span></p>
                                                    </div>
                                                </div>
                                                {/* {
                                                    (data.price!=='' && (
                                                        
                                                        <div className="w-full xl:w-32 text-right">
                                                            <div className="mr-5 flex h-9 w-full max-w-[150px] items-center justify-center rounded-lg bg-[#34D399]">
                                                                <span style={{marginRight:'7px', color:'slate', fontWeight:'bold'}}>Added</span>
                                                                <svg
                                                                    width="16"
                                                                    height="12"
                                                                    viewBox="0 0 16 12"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                    d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z"
                                                                    fill="white"
                                                                    stroke="white"
                                                                    ></path>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ))
                                                } */}
                                                <div className="w-full xl:w-32">
                                                    <button 
                                                    className="flex w-full justify-center rounded bg-primary p-1 font-medium text-gray hover:bg-opacity-90" 
                                                    onClick={(e:any) => handlePriceInputOK(e, data)}>
                                                        OK
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }

                        {/* Confirm update button */}
                        {
                            (prices.length > 0 
                                && prices[0].price !== '' 
                                && prices[0].x !== 0 
                                && prices[0].y !== 0 
                                && category 
                                && category.name 
                                && imageFile 
                                && imageFile.preview && imageFile.file &&  (
                                <div className="flex  justify-center w-full">
                                    <button 
                                    type="submit"
                                    className="flex w-auto justify-center rounded bg-primary p-3 px-8 font-medium text-gray hover:bg-opacity-90">
                                    Update
                                    </button>
                                </div>
                            ))
                            ||
                            (
                                <div className="flex  justify-center w-full">
                                    <button 
                                    className="flex w-auto justify-center rounded bg-primary p-3 px-8 font-medium text-gray bg-opacity-60"
                                    disabled>
                                    Update
                                    </button>
                                </div>
                            )
                        }
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MMPriceSettingEdit;