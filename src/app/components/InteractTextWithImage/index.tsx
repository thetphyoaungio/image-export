'use client';

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

const InteractTextWithImage = ({imagesrc, handlerCanvas, priceChange}:{imagesrc:string, handlerCanvas:Function, priceChange:Function}) => {
    //const [ textcoords, setTextCoords ] = useState({x:0, y:0});

    //const [isInputConfirm, setIsInputConfirm] = useState(true);

    const refcanvas:any = useRef();
    const refctx:any = useRef();
    const reftpaimg:any = useRef();
    
    
    useEffect(() => {
        refcanvas.current = document.getElementById('canvas');
        reftpaimg.current = document.getElementById('tpaimg');
        refctx.current = refcanvas.current?.getContext('2d');
        refcanvas.current.width = reftpaimg.current.width;
        refcanvas.current.crossOrigin = "Anonymous";
        refcanvas.current.height = reftpaimg.current.height;

        refctx.current.drawImage(reftpaimg.current, 0, 0);

        refctx.current.font = "21pt Verdana";
    }, []);

    

    const handleMouseClickOnCanvas = (e:MouseEvent|any) => {
        const rect = refcanvas.current.getBoundingClientRect();
        
        const xScale = refcanvas.current.width / rect.width;
        const yScale = refcanvas.current.height / rect.height;

        const x = (e.pageX - rect.left) * xScale;
        const y = (e.pageY - rect.top) * yScale;

        //console.log('got x,y >> ', x,y)

        return handlerCanvas({x:x, y:y});

        

        //setTextCoords(coords => ({...coords, x: x, y: y}));
        
        //setIsInputConfirm(false);
    }

    const handleInputText = useDebouncedCallback((e:any) => {
        //redraw image
        /* if(!isInputConfirm) {
            refctx.current.clearRect(0,0,refcanvas.current.width,refcanvas.current.height);
            refctx.current.drawImage(reftpaimg.current, 0, 0);
        } */

        //refill text
        //refctx.current.fillStyle = "#121212";
        //refctx.current.fillText(e.target.value, textcoords.x, textcoords.y);
    }, 800);

    const handlerInputConfirm = (e:any) => {
        e.preventDefault();
        //setIsInputConfirm(true);
    }

    return(
        <div className="flex flex-col gap-5.5 p-6.5">
            {/* <form className="flex flex-col gap-4"> */}
                <Image 
                id="tpaimg"
                style={{display:"none"}}
                src={imagesrc}  
                alt="Image 2"
                objectFit="cover" layout="fill" />

                {/* <input
                id="inp"
                type="text"
                placeholder="Price..."
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={handleInputText} /> */}

                {/* <button
                type="submit"
                className="inline-block rounded-md bg-meta-3 w-40 px-6 pb-2 pt-2.5 shadow-primary-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 disabled:opacity-70 dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                onClick={handlerInputConfirm}>
                    <span>Confirm</span>
                </button> */}
            {/* </form> */}

            <canvas id="canvas" onClick={handleMouseClickOnCanvas} />
        </div>
    )
}

export default InteractTextWithImage;