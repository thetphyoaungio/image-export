'use client';

import { ChangeEvent, useState, useRef, useEffect } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useDebouncedCallback } from "use-debounce";
import { SelectGroupTPA } from "@/app/components/SelectGroup/SelectGroupTwo";
import { fontColors, fontSizes, fontWeights, digitCounts } from "@/app/lib/data";
import { savePriceSetting } from "@/app/lib/mmprice-actions";
import { useFormState } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const initialState = {
    message: ""
};

const MMPriceSetting = () => {
    const noticeStr1 = `NOTICE: Before typing price values,`;
    const noticeStr2 = `Please set X and Y coordinates for each price by clicking on the image where price blank spaces.`;

    const fontColors$ = {title: 'Select Font Color', items: [...fontColors]};
    const fontSizes$ = {title: 'Select Font Size', items: [...fontSizes]};
    const fontWeights$ = {title: 'Select Font Weight(Bold)', items: [...fontWeights]};
    const digitCounts$ = {title: 'Select Digit Count', items: [...digitCounts]};
    
    const [ category, setCategory ] = useState({name:''});
    const [ imageFile, setImageFile ] = useState({file: null, preview: ''});
    const [ prices, setPrices ] = useState([{ price:'', x:0, y:0, id:1, color:'', size:'', fontweight:'' }]);
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

    const savePriceSettingWithPrices = savePriceSetting.bind(null,JSON.stringify(prices));
    const [state, formAction] = useFormState(savePriceSettingWithPrices, initialState);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [inputPrice, setInputPrice] = useState({ price:'', x:0, y:0, id:-1, color:'', size:'', fontweight:'' });
    const [isShowXYLines, setIsShowXYLines] = useState(true);

    useEffect(() => {
        prices.sort((a:any, b:any) => a.id < b.id ? -1 : (a.id > b.id ? 0 : 1));

        if(state?.message) {
            alert(state.message);

            router.push('/mmpricesettinglist');
        }
    }, [prices, state, router, searchParams, pathname]);

    //**price handlers */
    const handleAddNewPrice = (e:any) => {
        e.preventDefault();

        //check there is deleted ids
        if(deletedPrice) {
            setPrices(ps => ([...ps, { 
                price:'', 
                x:0, 
                y:0, 
                id:deletedPrice.id, 
                color: myFont.color, 
                size: myFont.size, 
                fontweight: myFont.weight 
            }]));

            setDeletedPrice((val:any) => ({...val, isNewGenerated: true}));
            
        } else {
            setPrices((prices$:any) => [...prices$, { 
                price:'', 
                x:0, 
                y:0, 
                id:prices.length+1, 
                color: myFont.color, 
                size: myFont.size, 
                fontweight: myFont.weight 
            }]);
        }
        
        setIsShowXYLines(true);
    }
    const handlePriceInputChange = useDebouncedCallback((e:any, data:any) => {
        setInputPrice({...data, price: e.target.value});
    }, 850);

    const handlePriceDelete = (e:any, price: any) => {
        e.preventDefault();

        setDeletedPrice({id: price.id, isNewGenerated: false});

        setPrices([...prices.filter((p:any) => p.id !== price.id)]);

        const filterdprices = [...prices.filter((p:any) => p.id !== price.id)];
        setTimeout(() => {
            reDrawCanvas(filterdprices);
        }, 0);
    }

    const handlePriceInputOK = (e:any, data:any) => {
        e.preventDefault();

        if(data.id === inputPrice.id) {
            const idx = prices.findIndex((p:any) => p.id === data.id);

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
    //**end price handlers */
    
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

    const handleMouseClickOnCanvas = (e:any) => {
        setIsShowXYLines(false);

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
                    setPrices([{ 
                        price:`P-${deletedPrice.id}${widthstr}`, 
                        x:x, 
                        y:y, 
                        id:1, 
                        color: myFont.color, 
                        size: myFont.size, 
                        fontweight: myFont.weight 
                    }]);

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
                    setPrices([{ 
                        price:`P-${prices.length}${widthstr}`, 
                        x:x, 
                        y:y, 
                        id:1, 
                        color: myFont.color,
                        size: myFont.size,
                        fontweight: myFont.weight
                     }]);
                } else if(prices.length > 1) {
                    prices[prices.length - 1].price = `P-${prices.length}${widthstr}`;
                    prices[prices.length - 1].x = x;
                    prices[prices.length - 1].y = y;

                    setPrices([...prices]);
                }
            }
        } else {
            alert('Please add new price!')
        }
    }
    
    

    const reDrawCanvas = (prices$:Array<any>) => {
        //redraw image
        refctx.current.clearRect(0,0,refcanvas.current.width,refcanvas.current.height);
        refctx.current.drawImage(reftpaimg.current, 0, 0);

        //refill text
        prices$.forEach((item:any) => { 
            refctx.current.fillStyle = `${item.color}`;
            refctx.current.font = `${item.fontweight} ${item.size} Verdana`;

            refctx.current.fillText(item.price, item.x, item.y); 
        });
    }

    const handleSelectChange = (value$:any, target:string) => {
        setMyFont(vals => ({
            ...vals,
            [target]: value$
        }));
    }

    

    
    
    const handleImageExport = (e:any) => {
        e.preventDefault();

        const lee:any = imageFile;
        const leename:string = lee.file.name;
        const leetype:string = lee.file.type;
        
        const dataUrl = refcanvas.current.toDataURL();
        
        const link = document.createElement('a');
        link.download = `${leename}.${leetype.replace('image/','')}`;
        link.href = dataUrl;
        link.click();
    }

    const handleReset = (e:any) => {
        e.preventDefault();

        setImageFile({file: null, preview: ''});
        setPrices([{ price:'', x:0, y:0, id:1, color:'', size:'', fontweight:'' }]);
        setMyFont({
            color: fontColors$.items[0].value, 
            size: fontSizes$.items[0].value, 
            weight: fontWeights$.items[0].value,
            width: digitCounts$.items[0].value,
        });
        setDeletedPrice(null);
        setInputPrice({ price:'', x:0, y:0, id:-1, color:'', size:'', fontweight:'' });

        //redraw image
        refcanvas.current.width = 0;
        refcanvas.current.height = 0;

        refctx.current.clearRect(0,0,refcanvas.current.width,refcanvas.current.height);
        refctx.current.drawImage(reftpaimg.current, 0, 0);

        setIsShowXYLines(true);
    }

    const handleMouseMove = (e:any) => {
        if(isShowXYLines===true) {
            refctx.current.clearRect(0,0,refcanvas.current.width,refcanvas.current.height);
            refctx.current.drawImage(reftpaimg.current, 0, 0);

            //refill existing text
            prices.forEach((item:any) => { 
                refctx.current.fillStyle = `${item.color}`;
                refctx.current.font = `${item.fontweight} ${item.size} Verdana`;

                refctx.current.fillText(item.price, item.x, item.y); 
            });

            // get x & y
            const rect = refcanvas.current.getBoundingClientRect();
            const xScale = refcanvas.current.width / rect.width;
            const yScale = refcanvas.current.height / rect.height;
            const x = (e.pageX - rect.left) * xScale;
            const y = ((e.pageY - rect.top) * yScale) + 2;
            
            drawCoordLine(x,'x');
            drawCoordLine(y,'y');
        }
    }

    const drawCoordLine = (coordval:number, type:string) => {
        refctx.current.beginPath();

        type === 'x' ? 
        refctx.current.moveTo(coordval, 0) 
        : refctx.current.moveTo(0, coordval);

        type === 'x' ? 
        refctx.current.lineTo(coordval, refcanvas.current.height) 
        : 
        refctx.current.lineTo(refcanvas.current.width, coordval);

        refctx.current.lineWidth = 1;
        refctx.current.strokeStyle = "red";
        refctx.current.stroke();
    }

    return (
        <div className="mx-auto max-w-7xl">
            <Breadcrumb pageName="Price Setting" />

            <div className="flex flex-col gap-9">
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="p-6.5">
                        <form action={formAction}>
                            {/* Image with canvas */}
                            <div className="mb-4.5">
                                <div>
                                    <label 
                                    htmlFor="uploaderid" 
                                    className="inline-flex items-center justify-center w-full md:w-auto gap-2.5 rounded-md bg-cyan-500 text-white px-8 py-2 text-center font-medium hover:bg-cyan-600 lg:px-8 xl:px-10">
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
                                        Image Select

                                        <input
                                        id="uploaderid"
                                        type="file"
                                        accept=".png, .jpg, .jpeg" 
                                        style={{display: 'none'}}
                                        onChange={e => handleImageUpload(e)} 
                                        name="img-file" />
                                    </label>

                                    <div className="mt-4.5">
                                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                        Preview
                                        </label>

                                        <div className="flex flex-col gap-9">
                                            {
                                                imageFile.preview && 
                                                (
                                                    <Image
                                                    id="tpaimg" 
                                                    src={imageFile.preview}  
                                                    alt="Image 2" 
                                                    objectFit="cover" 
                                                    layout="fill" 
                                                    style={{
                                                        display:"none"
                                                    }} />
                                                )
                                            }

                                            <canvas 
                                            id="canvaslee" 
                                            onClick={handleMouseClickOnCanvas} width={0} height={0}
                                            onMouseMoveCapture={(e)=>handleMouseMove(e)} />      
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            {
                                imageFile && imageFile.preview && 
                                (
                                    <div className="mb-4.5">
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

                                        {
                                            prices.map((data:any, i:number) => (
                                                <div className="p-3 mb-4.5 flex flex-col items-center gap-3 xl:flex-row rounded bg-slate-100" key={`price-${data.id}`}>
                                                    <div className="grow w-full xl:w-5/6">
                                                        <input 
                                                        defaultValue={data.price}
                                                        type="text"
                                                        placeholder="Type price"
                                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                                        onChange={(e) => handlePriceInputChange(e, data)}/>
                                                    </div>
                                                    
                                                    <div className="w-full xl:w-24">
                                                        <button 
                                                        className="flex w-full justify-center rounded bg-primary p-1 font-medium text-gray hover:bg-opacity-90" 
                                                        onClick={(e:any) => handlePriceInputOK(e, data)}>
                                                        OK
                                                        </button>
                                                    </div>
                                                    <div className="w-full xl:w-32">
                                                        <button 
                                                        className="flex w-full justify-center rounded bg-danger p-1 font-medium text-gray hover:bg-opacity-90" 
                                                        onClick={(e:any) => handlePriceDelete(e, data)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }

                            {/* Confirm button */}
                            {
                                (prices.length > 0 
                                    && prices[0].price !== '' 
                                    && prices[0].x !== 0 
                                    && prices[0].y !== 0 
                                    && imageFile 
                                    && imageFile.preview && imageFile.file &&  (
                                    <div className="flex  justify-center w-full">
                                        <button 
                                        className="flex w-auto justify-center rounded bg-primary p-3 px-8 font-medium text-gray hover:bg-opacity-90"
                                        onClick={(e) => handleImageExport(e)}>
                                        Export/Download Image
                                        </button>

                                        <div className="w-full xl:w-32 ml-3">
                                            <button 
                                            className="flex w-auto justify-center rounded bg-green-500 p-3 px-8 font-medium text-gray hover:bg-opacity-90"
                                            onClick={(e) => handleReset(e)}>
                                            Reset
                                            </button>
                                        </div>
                                    </div>
                                ))
                                ||
                                (
                                    <div className="flex  justify-center w-full">
                                        <button 
                                        className="flex w-auto justify-center rounded bg-primary p-3 px-8 font-medium text-gray bg-opacity-60"
                                        disabled
                                        >
                                        Export/Download Image
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

export default MMPriceSetting;