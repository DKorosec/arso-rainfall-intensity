export interface ILatestRadarSnapshotsTimelineHttpResult {
    height: string;
    width: string;
    valid: string;
    mode: string;
    date: string;
    path: string;
    hhmm: string;
    bbox: string;
}

export interface IPoint {
    x: number,
    y: number
}

export interface IPixel {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface IPixelRadarResult {
    pixel: [number, number, number];
    value: number;
    group: number;
}

export interface IBBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}