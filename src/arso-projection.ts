import RadarImageProjection from './radar-image-projection';
import { IPixelRadarResult, IPoint, IBBox } from './types';
import { assertNotNull } from './assertions';

export type { IPixelRadarResult };

const noReadingPixelResult: IPixelRadarResult = { pixel: [0, 0, 0], value: 0, group: 0 };

export const radarColorsInfo: IPixelRadarResult[] = [
    { pixel: [203, 0, 204], value: 57, group: 4 },
    { pixel: [181, 3, 3], value: 54, group: 4 },
    { pixel: [211, 0, 0], value: 51, group: 4 },
    { pixel: [255, 62, 1], value: 48, group: 3 },
    { pixel: [254, 132, 0], value: 45, group: 3 },
    { pixel: [254, 198, 0], value: 42, group: 3 },
    { pixel: [249, 250, 1], value: 39, group: 3 },
    { pixel: [184, 250, 0], value: 36, group: 2 },
    { pixel: [108, 249, 0], value: 33, group: 2 },
    { pixel: [66, 235, 66], value: 30, group: 2 },
    { pixel: [4, 216, 131], value: 27, group: 2 },
    { pixel: [0, 220, 254], value: 24, group: 1 },
    { pixel: [0, 174, 253], value: 21, group: 1 },
    { pixel: [0, 120, 254], value: 18, group: 1 },
    { pixel: [8, 70, 254], value: 15, group: 1 },
    noReadingPixelResult
];

const radarColorsInfoMap: Map<string, IPixelRadarResult> = new Map(radarColorsInfo
    .map((colors) => [`${colors.pixel[0]}-${colors.pixel[1]}-${colors.pixel[2]}`, colors]));

export default class ArsoProjection extends RadarImageProjection {
    public readonly interestPixelBounds: IBBox;
    protected imagePixelRadarMap: (IPixelRadarResult)[][] | null;

    constructor() {
        const degreeProj = 'EPSG:900913';
        const meterProj = 'EPSG:4326';
        // bbox from arso is wrongly aligned or proj is not totally correct
        // causing offset, which is fixed with those manually polished points.
        const bboxSW: IPoint = { x: 44.657, y: 12.10 };
        const bboxNE: IPoint = { x: 47.407, y: 17.44 };
        super(degreeProj, meterProj, bboxSW, bboxNE);

        // arso decided to color the red bbox the same color scheme
        // that matches radar results in pixels. So values on the border
        // or near it get interpolated and can match color scheme
        // but most definitely the rgb[211,0,0] is matched always.
        // mostly it can be avoided by looking into alpha channel.
        // as radar pixel values have alpha set to 255. but this grid also 
        // has lines with alpha set to 255. therefor the result must
        // always check if colors match radar colors.
        this.interestPixelBounds = {
            x1: 25, x2: 774,
            y1: 12, y2: 585
        };

        this.imagePixelRadarMap = null;
    }

    loadImageFromBuffer(buffer: Buffer): void {
        super.loadImageFromBuffer(buffer);
        this._preprocessLoadedImage();
    }

    isPixelInInterestBounds({ x, y }: IPoint): boolean {
        const { x1, y1, x2, y2 } = this.interestPixelBounds;
        return x1 <= x && x <= x2 && y1 <= y && y <= y2;
    }

    getPixelRadarValue({ x, y }: IPoint): IPixelRadarResult {
        assertNotNull(this.imagePixelRadarMap, 'Image not loaded.');
        return this.imagePixelRadarMap[y][x];
    }

    _mapPixelLocationToRadarValue({ x, y }: IPoint): IPixelRadarResult {
        const { r, g, b, a } = this.getPixelInfo({ x, y });
        if (a !== 255) {
            return noReadingPixelResult;
        }
        const colorResult = radarColorsInfoMap.get(`${r}-${g}-${b}`);
        if (!colorResult) {
            return noReadingPixelResult;
        }
        return colorResult;
    }

    _preprocessLoadedImage(): void {
        assertNotNull(this.image, 'Image not loaded.');
        const { width, height, data } = this.image;
        // Remove pixels that are outside area of interest or
        // if they contain unknown values.
        // Then create map that maps pixel to radar read value
        this.imagePixelRadarMap = new Array(width).fill(null)
            .map(() => new Array(height).fill(null));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (width * y + x) << 2;
                const pixelValue = this._mapPixelLocationToRadarValue({ x, y });
                const pixelOutOfBounds = !this.isPixelInInterestBounds({ x, y });
                const pixelUnknownValue = !pixelValue;
                const isIrrelevant = pixelOutOfBounds || pixelUnknownValue;
                this.imagePixelRadarMap[y][x] = pixelValue;
                if (isIrrelevant) {
                    data[idx] = 0;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                    data[idx + 3] = 0;
                }
            }
        }
    }
}