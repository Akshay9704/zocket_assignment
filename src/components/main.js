import { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { SketchPicker } from 'react-color';
import Divider from '@mui/material/Divider';
import Data from "../data/data.json";

const Root = styled('div')(({ theme }) => ({
    width: '80%',
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
    '& > :not(style) ~ :not(style)': {
        marginTop: theme.spacing(3),
    },
}));

// Defined a function to draw a rounded rectangle
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    this.stroke();
}

const Main = () => {
    const canvasRef = useRef(null);
    const inputRef = useRef(null);
    const captionData = Data.caption;
    const ctaData = Data.cta;

    const [text, setText] = useState(captionData.text);
    const [ctaText, setCtaText] = useState(ctaData.text);
    const [image, setImage] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [picker, setPicker] = useState("#0369A1");

    const pickerHandler = (color) => {
        setPicker(color.hex);
    }

    const handleChange = (e) => {
        if (e.target.id === "text") {
            setText(e.target.value);
        } else if (e.target.id === "ctaText") {
            setCtaText(e.target.value);
        }
    }

    const handleImageClick = () => {
        inputRef.current.click();
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log(file);
        setImage(URL.createObjectURL(file));
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawRectangle = () => {
            // Layer 1: Rectangle
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.roundRect(450, 20, 610, 800, 100);
        };

        const drawTemplateLine = () => {
            // Layer 2: Template Line
            ctx.strokeStyle = picker;
            ctx.lineWidth = 500;
            ctx.beginPath();
            ctx.moveTo(300, -135);
            ctx.lineTo(canvas.width, canvas.height);
            ctx.stroke();
        };

        const drawMaskImage = () => {
            // Layer 3: Mask Image
            if (!image) {
                const maskImage = new Image();
                maskImage.onload = function () {
                    ctx.globalCompositeOperation = "source-over";
                    ctx.drawImage(maskImage, 70, -395, 955, 1200);
                };
                maskImage.src = `${Data.urls.mask}?random=${Math.floor(Math.random() * 10) + 100}`;
            }
        };

        const drawApartmentImage = () => {
            // Layer 4: Apartment Image
            const apartmentImage = new Image();
            apartmentImage.onload = function () {
                ctx.globalCompositeOperation = "destination";
                ctx.drawImage(apartmentImage, 100, 70, 900, 700);
            };
            apartmentImage.src = image;
        };

        const drawCaption = () => {
            // Layer 5: Caption
            ctx.font = "30px Arial";
            let lines = [];
            let currentLine = "";
            const words = text.split(" ");
            const maxWords = captionData.max_characters_per_line;
            const fontSize = captionData.font_size;

            words.forEach((word) => {
                const testLine = currentLine + word + " ";
                const testWidth = ctx.measureText(testLine).width;

                if (testWidth > maxWords * (fontSize / 2)) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    currentLine = testLine;
                }
            });

            lines.push(currentLine.trim());

            lines.forEach((line, index) => {
                ctx.fillText(line, 120, 860 + index * fontSize * 1.2);
            });
        };

        const drawButton = () => {
            // Save the current state of the canvas
            ctx.save();

            // Layer 6: Rounded Rectangle for Button
            ctx.strokeStyle = ctaData.background_color;
            ctx.lineWidth = 3;
            ctx.roundRect(700, 835, 230, 60, 25);
            ctx.stroke();

            // Layer 7: Button
            ctx.fillStyle = ctaData.background_color;
            ctx.fill();
            ctx.fillStyle = ctaData.text_color;
            ctx.font = '25px Arial';
            ctx.fillText(ctaText, 760, 873);
            ctx.restore();
        };

        drawRectangle(); // Layer 1
        drawTemplateLine(); // Layer 2
        drawMaskImage(); // Layer 3
        drawApartmentImage(); // Layer 4
        drawCaption(); // Layer 5
        drawButton(); // Layer 6
    }, [text, ctaText, image, picker]);


    return (
        <div className='flex'>
            {/* Image Container */}
            <div style={{ height: "100vh" }} className='flex justify-center items-center w-1/2 bg-gray-500'>
                <div style={{ transform: 'scale(0.6)' }}>
                    <canvas ref={canvasRef} id="canvas" width="1080" height="1080" style={{ backgroundColor: "white" }}></canvas>
                </div>
            </div>
            {/* Select an Image */}
            <div style={{ height: "100vh" }} className='flex flex-col justify-center items-center w-1/2 bg-white'>
                <h2 className='font-bold text-3xl'>Ad customization</h2>
                <h4 className='text-gray-400 text-md'>Customise your ad and get the ctxlate accordingly</h4>
                <Root>
                    <div className='flex gap-1 mt-8 border-2 rounded-2xl py-4 px-4'>
                        <img src='/' alt='' />
                        <p className='text-gray-500 text-md'>Change the ad creative image.</p>
                        <p onClick={handleImageClick} className='font-bold cursor-pointer text-blue-600'>select file</p>
                        <input type='file' onChange={handleImageChange} ref={inputRef} className='hidden font-bold text-blue-600' />
                    </div>
                    <Divider>Edit Contents</Divider>
                    <div className='mt-8 border-2 rounded-2xl py-2 px-4'>
                        <p className='text-gray-500 text-md'>Ad Content</p>
                        <input style={{ outline: "none" }} onChange={handleChange} value={text} id="text" className='text-black font-bold text-md rounded-none w-full' />
                    </div>
                    <div className='border-2 rounded-2xl py-2 px-4'>
                        <p className='text-gray-500 text-md'>CTA</p>
                        <input style={{ outline: "none" }} onChange={handleChange} value={ctaText} id="ctaText" className='text-black font-bold text-md rounded-none w-full' />
                    </div>
                    <div>
                        <p className='text-gray-600 text-md'>Change your color</p>
                        <div onClick={() => setShowPicker(!showPicker)} className='mt-3 flex justify-center items-center border-2 w-10 h-10 rounded-full'>+</div>
                        {showPicker && <SketchPicker color={picker} onChange={pickerHandler} />}
                    </div>
                </Root>
            </div>
        </div>
    )
}

export default Main;