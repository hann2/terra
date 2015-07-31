var processing = (function() {
    var processing = {};

    processing.bias = function(b, value) {
        return value / ((((1.0 / b) - 2.0) * (1.0 - value)) + 1.0);
    };

    processing.gain = function(g, value) {
        if (value < 0.5) {
            return processing.bias(g, value * 2.0)/2.0;
        } else {
            return processing.bias(1.0 - g, value * 2.0 - 1.0)/2.0 + 0.5;
        }
    };

    processing.sqrt = function(value) {
        return Math.sqrt(value);
    };

    processing.sqr = function(value) {
        return value * value;
    };

    processing.gaussian = function(x, y, xVariance, yVariance) {
        return Math.exp(-((x * x) / (2 * xVariance) + (y * y) / (2 * yVariance)));
    };

    processing.turbulence = function(x, y, persistence, octaves) {
        var frequency = 1;
        var amplitude = 1;
        var sum = 0;

        for (var i = 0; i < octaves; i++) {
            sum += noise.perlin2(x * frequency, y * frequency) * amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return sum;
    };

    processing.normalize = function(data) {
        var max = data[0];
        var min = data[0];
        for (var i = 0; i < data.length; i++) {
            var value = data[i];
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
        if (!data.queue) {
            data.queue = [];
        }
        data.queue.push([max, min]);

        var range = max - min;
        for (var i = 0; i < data.length; i++) {
            data[i] = range === 0 ? 0 : (data[i] - min) / range;
        }
    };

    processing.normalizeCalibrated = function(data, calibrationData) {
        var max = calibrationData.queue[0][0];
        var min = calibrationData.queue[0][1];
        calibrationData.queue.shift();
        var range = max - min;
        for (var i = 0; i < data.length; i++) {
            data[i] = range === 0 ? 0 : (data[i] - min) / range;
            data[i] = Math.min(1, Math.max(0, data[i]));
        }
    };

    /**
     *  Return a list of local maxima
     */
    processing.getMax = function(data, width, height) {
        var local = [];
        for (var xpos = 0; xpos < width; xpos++){
            for (var ypos = 0; ypos < height; ypos++){
                var maxNeighbor = 0;
                var myval = data[xpos + ypos * width];
                for (var neighborX = -1; neighborX < 2; neighborX++){
                    for (var neighborY = -1; neighborY < 2; neighborY++){
                        var x = xpos + neighborX;
                        var y = ypos + neighborY;
                        if (x >= 0 && y >= 0 && x < width && y < height && data[x+y*width] >= myval){
                            maxNeighbor = neighborX + 3 * neighborY;
                            myval = data[x+y*width];
                        }
                    }
                }
                if (maxNeighbor === 0) {
                    local.push(xpos + ypos * width);
                }
            }
        }
        return local;
    }

    /**
     *  Return a list of local maxima
     */
    processing.getMin = function(data, width, height) {
        var local = [];
        for (var xpos = 0; xpos < width; xpos++){
            for (var ypos = 0; ypos < height; ypos++){
                var minNeighbor = 0;
                var myval = data[xpos + ypos * width];
                for (var neighborX = -1; neighborX < 2; neighborX++){
                    for (var neighborY = -1; neighborY < 2; neighborY++){
                        var x = xpos + neighborX;
                        var y = ypos + neighborY;
                        if (x >= 0 && y >= 0 && x < width && y < height && data[x+y*width] <= myval){
                            minNeighbor = neighborX + 3 * neighborY;
                            myval = data[x+y*width];
                        }
                    }
                }
                if (minNeighbor === 0) {
                    local.push(xpos + ypos * width);
                }
            }
        }
        return local;
    }

    /**
     *  Return a list of prominence for each local maxima
     *  Floodfill the points that can be reached by descending all local maxima
     *  start at the smallest and working upwards
     *  Then iterate through floodfilled values and record the lowest point for each maxima
     *  
     */
    processing.getProminence = function(maxima, data, width, height) {
        //order maxima
        var orderedMaxima = maxima.slice();
        orderedMaxima.sort(function(a, b){
            return data[a] - data[b];
        });
        //floodfill
        var floodfilled = data.slice();
        for (var i = 0; i < orderedMaxima.length; i++){
            processing.floodfillDescending(floodfilled, orderedMaxima[i], orderedMaxima[i], data, width, height);
        }

        //find prominence
        var mapping = {};
        for (var i = 0; i < orderedMaxima.length; i++){
            mapping[orderedMaxima[i]] = maxima.indexOf(orderedMaxima[i]);
        }
        var prominence = [];
        for (var i = 0; i < maxima.length; i++){
            prominence.push(0);
        }
        for (var xpos = 0; xpos < width; xpos++){
            for (var ypos = 0; ypos < height; ypos++){
                var position = floodfilled[xpos + ypos * width]
                var arrayPos = mapping[position];
                var val = data[position] - data[xpos + ypos * width];
                if (prominence[arrayPos] < val){
                    prominence[arrayPos] = val;
                }
            }
        }
        return prominence;
    }

    /**
     *  Prominence helper function
     *  will wirte the value startingVal into the array floodfilled
     *  if it can be reached by only descending heightmap values
     *  starts at position startingVal
     *  
     */
    processing.floodfillDescending = function(floodfilled, startingVal, writeVal, heightmap, width, height) {
        floodfilled[startingVal] = writeVal;
        var xpos = startingVal % width;
        var ypos = Math.floor(startingVal / width);
        var myVal = heightmap[startingVal];
        for (var neighborx = -1; neighborx < 2; neighborx++){
            for (var neighbory = -1; neighbory < 2; neighbory++){
                var x = xpos + neighborx;
                var y = ypos + neighbory;
                var arrayPos = x + y*width;
                if (x >= 0 && y >= 0 && x < width && y < height){
                    if (floodfilled[arrayPos] != writeVal && heightmap[arrayPos] <= myVal){
                        processing.floodfillDescending(floodfilled, arrayPos, writeVal, heightmap, width, height);
                    }
                }
            }
        }
    }

    /**
     *  Anti-Prominence
     *  For lakes!
     */
    processing.antiProminence = function(minima, data, width, height){
        var dataInverse = data.slice();
        for(var i = 0; i < dataInverse.length; i++){
            dataInverse[i] = dataInverse[i] * -1;
        }
        return processing.getProminence(minima, dataInverse, width, height);
    }

    return processing;
})();

