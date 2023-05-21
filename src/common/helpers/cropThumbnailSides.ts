import fs from 'node:fs';
import sharp from "sharp";
import { logError } from './log.js';
import OperationResult from "../models/operationResult.js";

const hasSideColor = (pixels: Buffer, width: number, height: number) => {
    const getPixelColor = (x: number, y: number) => {
        const position = (x + y * width) * 3; /* Pixels data array color channel count */
        let result = "";
        for (let i = 0; i < 3; i++) /* RGB */ {
            result += pixels[position + i].toString();
        }
        return result;
    },
        solidColorAreaWidth = (width - height) / 2,
        checkCounts = 5,
        targetColor = getPixelColor(solidColorAreaWidth / 2, height / 2);
    const padding = solidColorAreaWidth * 0.1;
    const colorChecker = (spotsChecked: number): boolean => {
        const randomX = Math.floor(Math.round(Math.random() * (solidColorAreaWidth - (2 * padding))) + padding + (spotsChecked % 2 ? height + solidColorAreaWidth : 0)); /* from padding to area-padding */
        const randomY = Math.floor(spotsChecked / 2) * (height / checkCounts);
        if (spotsChecked >= checkCounts * 2)
            return true;
        if (getPixelColor(randomX, randomY) === targetColor)
            return colorChecker(spotsChecked + 1);
        else
            return false;
    };
    return colorChecker(0);
}

export default async (jpgFilePath: string) => new Promise<OperationResult>(async resolve => {
    const operationResult = new OperationResult();

    const { data, info } = await sharp(jpgFilePath)
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixels = data;
    const width = info.width;
    const height = info.height;


    if (width >= 720 && width > height && hasSideColor(pixels, width, height)) /* Crop thumbnail if both sides of image has the same solid color */ {
        sharp(jpgFilePath)
            .extract({ width: height, height, left: (width - height) / 2, top: 0 })
            .toBuffer(function (err, buffer) {
                if (err) {
                    resolve(operationResult.failed("coverCropError"));
                }
                fs.writeFile(jpgFilePath, buffer, function (err) {
                    if (err) {
                        logError("Crop thumbnail sides / Write cropped file", err);
                        resolve(operationResult.failed("croppedCoverSaveError"));
                    }
                    else {
                        resolve(operationResult.succeeded());
                    }
                });
            });
    }
    else {
        resolve(operationResult.succeeded());
    }
});