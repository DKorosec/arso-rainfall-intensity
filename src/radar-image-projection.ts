import proj4, { InterfaceProjection } from 'proj4';
import { PNG } from "pngjs";
import { IPoint, IPixel } from './types';
import { assertNotNull } from './assertions';

export default class RadarImageProjection {
    protected degreeP: InterfaceProjection;
    protected meterP: InterfaceProjection;
    protected mBoundSW: IPoint;
    protected mBoundNE: IPoint;
    protected dBoundSW: IPoint;
    protected dBoundNE: IPoint;
    protected image: PNG | null;

    constructor(
        degreeUnitProjectionName: string,
        meterUnitProjectionName: string,
        degBboxSW: IPoint,
        degBboxNE: IPoint
    ) {
        this.degreeP = proj4.Proj(degreeUnitProjectionName);
        this.meterP = proj4.Proj(meterUnitProjectionName);
        this.mBoundSW = this.projectDegrees2MeterUnits(degBboxSW);
        this.mBoundNE = this.projectDegrees2MeterUnits(degBboxNE);
        this.dBoundSW = degBboxSW;
        this.dBoundNE = degBboxNE;
        this.image = null;
    }

    get width(): number {
        assertNotNull(this.image, 'Image not loaded.');
        return this.image.width;
    }

    get height(): number {
        assertNotNull(this.image, 'Image not loaded.');
        return this.image.height;
    }

    loadImageFromBuffer(buffer: Buffer): void {
        this.image = PNG.sync.read(buffer, { checkCRC: false });
    }

    getImageBuffer(): Buffer {
        assertNotNull(this.image, 'Image not loaded.');
        return PNG.sync.write(this.image);
    }

    getPixelInfo({ x, y }: IPoint): IPixel {
        assertNotNull(this.image, 'Image not loaded.');
        const idx = (this.image.width * y + x) << 2;
        return {
            r: this.image.data[idx],
            g: this.image.data[idx + 1],
            b: this.image.data[idx + 2],
            a: this.image.data[idx + 3]
        };
    }

    projectImagePixelToDegreeUnit({ x, y }: IPoint): IPoint {
        // (0,0) = top left
        const pt = this.projectImagePixelToMeterUnit({ x, y });
        return this.projectMetersToDegreeUnits(pt);
    }

    projectImagePixelToMeterUnit({ x, y }: IPoint): IPoint {
        // (0,0) = top left
        assertNotNull(this.image, 'Image not loaded.');
        const pxMeters = this.mBoundSW.x + (this.mBoundNE.x - this.mBoundSW.x) * x / this.image.width;
        const pyMeters = this.mBoundNE.y + (this.mBoundSW.y - this.mBoundNE.y) * y / this.image.height;
        return { x: pxMeters, y: pyMeters };
    }

    projectDegreeUnitToImagePixel({ x, y }: IPoint): IPoint {
        const pt = this.projectDegrees2MeterUnits({ x, y });
        return this.projectMeterUnitToImagePixel(pt);
    }

    projectMeterUnitToImagePixel({ x, y }: IPoint): IPoint {
        assertNotNull(this.image, 'Image not loaded.');
        const mInput = { x, y };
        const rX = (mInput.x - this.mBoundSW.x) / (this.mBoundNE.x - this.mBoundSW.x);
        const rY = (mInput.y - this.mBoundNE.y) / (this.mBoundSW.y - this.mBoundNE.y);

        if (rX < 0 || rX > 1 || rY < 0 || rY > 1) {
            throw new Error('given units are not inside defined bounds.');
        }

        return {
            x: Math.min(Math.floor(rX * this.image.width), this.image.width - 1),
            y: Math.min(Math.floor(rY * this.image.height), this.image.height - 1)
        };
    }

    projectDegrees2MeterUnits({ x, y }: IPoint): IPoint {
        return proj4.transform(this.degreeP, this.meterP, { x, y });
    }

    projectMetersToDegreeUnits({ x, y }: IPoint): IPoint {
        return proj4.transform(this.meterP, this.degreeP, { x, y });
    }
}