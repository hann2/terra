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

        var range = max - min;
        for (var i = 0; i < data.length; i++) {
            data[i] = range === 0 ? 0 : (data[i] - min) / range;
        }
    };

    /**
     *  Normalizes, considering only the region within calibratedWidth/calibratedHeight
     *      assumes calibratedWidth >= width && height >= calibratedHeight
     */
    processing.normalizeCalibrated = function(data, width, height, calibratedWidth, calibratedHeight) {
        var max = data[Math.floor(width / 2) + Math.floor(height / 2) * width];
        var min = max;
        var xOffset = Math.floor((calibratedWidth - width) / 2);
        var yOffset = Math.floor((calibratedHeight - height) / 2);
        for (var i = 0; i < calibratedWidth; i++) {
            for (var j = 0; j < calibratedWidth; j++) {
                var x = i + xOffset;
                var y = j + yOffset;
                var value = data[x + j * width];
                if (value > max) {
                    max = value;
                }
                if (value < min) {
                    min = value;
                }
            }
        }

        var range = max - min;
        for (var i = 0; i < data.length; i++) {
            data[i] = range === 0 ? 0 : (data[i] - min) / range;
            data[i] = Math.min(1, Math.max(0, data[i]));
        }
    };

    return processing;
})();

