import axios from 'axios';
import { ILatestRadarSnapshotsTimelineHttpResult } from './types';

class RadarDataSnapshot {
    height: number;
    width: number;
    dateTime: Date;
    dateCompact: string;
    timeCompact: string;
    radarImageUrlPath: string;
    mode: string;
    
    constructor(arsoResultItem: ILatestRadarSnapshotsTimelineHttpResult) {
        this.height = Number(arsoResultItem.height);
        this.width = Number(arsoResultItem.width);
        this.dateTime = new Date(arsoResultItem.valid);
        this.dateCompact = arsoResultItem.date;
        this.timeCompact = arsoResultItem.hhmm;
        this.radarImageUrlPath = `http://www.vreme.si${arsoResultItem.path}`;
        this.mode = arsoResultItem.mode;
    }

    async fetchRadarImageBuffer(): Promise<Buffer> {
        const imgBuffer = await axios.get<ArrayBuffer>(this.radarImageUrlPath, {
            responseType: "arraybuffer"
        });
        return Buffer.from(imgBuffer.data);
    }
}

export async function fetchLatestRadarSnapshotsTimeline(): Promise<RadarDataSnapshot[]> {
    const apiUrl = 'http://www.vreme.si/api/1.0/inca_precip_data/';
    const response = await axios.get<ILatestRadarSnapshotsTimelineHttpResult[]>(apiUrl, {
        responseType: 'json'
    });
    return response.data.map(item => new RadarDataSnapshot(item));
}

