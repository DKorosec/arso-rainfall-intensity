# arso-rainfall-intensity

* This project is written in *typescript 3.9*, but you can use its transpiled javascript built which targets *ES2015*. 
* Built includes typings and declaration map (for debugging), so if your IDE is good enough you'll get module type hints working with JS.

----

Documentation by example:

```javascript
    const fs = require('fs');
    const { ArsoHttpApi, ArsoProjection } = require('arso-rainfall-intensity');
    
    // returns snapshots from oldest to newest (moving window 2 hours span, with sample rate of 5 mins) 
    const latestSnapshots = await ArsoHttpApi.fetchLatestRadarSnapshotsTimeline();
    const mostRecentSnapshot = latestSnapshots[latestSnapshots.length - 1];
    console.log('snapshot time:', mostRecentSnapshot.dateTime);
    // fetch the radar image
    const radarImageBuffer = await mostRecentSnapshot.fetchRadarImageBuffer();
    // for debug view we can save it on disk
    fs.writeFileSync('latest.png', radarImageBuffer);

    const projection = new ArsoProjection();
    // initialize the projection from buffer, striping all unknown pixel colors seen in image.
    // developer must ensure that the image buffer is from the arso api (if he's not using the given api wrapper in this module).
    projection.loadImageFromBuffer(radarImageBuffer);

    // loadImageFromBuffer strips all unknown pixels and sets them to 0,0,0,0 - rgba (For example: removing the red border around the borders of radar image)
    fs.writeFileSync('latest-processed.png', projection.getImageBuffer());

    // returns rgba pixel values at given location in picture 
    // Note 0,0 is top left of the picture.
    projection.getPixelInfo({ x: 69, y: 69 });

    // returns result object that inteprets pixel values 
    // * result.value = integer value of dBZ (range of 0 - 57) - decibel relative to Z https://en.wikipedia.org/wiki/DBZ_(meteorology)
    // * result.group = integer range of 0 - 4, gruping by near values of .value [0 dBZ = 0, 15-24 dBZ = 1, 27-36 dBZ = 2, 39-48 dBZ = 3,  51-57 dBZ = 4]
    // * result.pixel = rgb value of the pixel (ignoring alpha)
    projection.getPixelRadarValue({ x: 69, y: 69 });

    // because radar image is bad at the bounds (preprocessing is removing all pixels outside)
    // you can check if point is inside the boundings.
    projection.isPixelInInterestBounds({ x: 69, y: 69 });
    // instead of using the above method, bounds can be accessed from the following property.
    projection.interestPixelBounds

    // Given lng lat, returns the pixel position in radar image.
    projection.projectDegreeUnitToImagePixel({ x: LNG_VALUE, y: LAT_VALUE });

    // Given lng lat, returns meter position
    projection.projectDegrees2MeterUnits({ x: LNG_VALUE, y: LAT_VALUE });

    // give pixel location, returns the lng lat postion
    projection.projectImagePixelToDegreeUnit({ x: 69, y: 69 });

    // give pixel location, returns the meter postion
    projection.projectImagePixelToMeterUnit({ x: 69, y: 69 });

    // give meter location, returns the pixel position
    projection.projectMeterUnitToImagePixel({ x: METER_LNG_VALUE, y: METER_LAT_VALUE });

    // give meter locatiom, returns the lng lat position
    projection.projectMetersToDegreeUnits({ x: METER_LNG_VALUE, y: METER_LAT_VALUE });
```


