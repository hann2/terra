var Signal2D = (function() {
    function Signal2D(data) {
        this.width = data.length;
        this.height = data[0].length;
        if (Array.isArray(data[0][0])) {
            this.depth = data[0][0].length;
            this.data = data
        } else {
            this.depth = 1;
            var newData = [];
            for (var i = 0; i < data.length; i++) {
                newData[i] = [];
                for (var j = 0; j < data[0].length; j++) {
                    newData[i][j] = [data[i][j]];
                }
            }
            this.data = newData;
        }
    }

    Signal2D.prototype.perPixel = function(f) {
        var newData = [];
        for (var i = 0; i < this.data.length; i++) {
            newData[i] = [];
            for (var j = 0; j < this.data[0].length; j++) {
                newData[i][j] = f(this.data[i][j], [i, j]);
            }
        }
        return new Signal2D(newData);
    };

    Signal2D.prototype.perChannel = function(f) {
        var newData = [];
        for (var i = 0; i < this.data.length; i++) {
            newData[i] = [];
            for (var j = 0; j < this.data[0].length; j++) {
                newData[i][j] = [];
                for (var k = 0; k < this.data[0][0].length; k++) {
                    newData[i][j][k] = f(this.data[i][j][k], [i, j, k]);
                }
            }
        }
        return new Signal2D(newData);
    };

    Signal2D.prototype.add = function(signal) {
        if (signal.data) {
            return this.perChannel(
                function(value, coord) {
                    return value + signal.data[coord[0]][coord[1]][coord[2]];
                }
            );
        }
        return this.perChannel(
            function(value, coord) {
                return value + signal;
            }
        );
    };

    Signal2D.prototype.multiply = function(signal) {
        if (signal.data) {
            return this.perChannel(
                function(value, coord) {
                    return value * signal.data[coord[0]][coord[1]][coord[2]];
                }
            );
        }
        return this.perChannel(
            function(value, coord) {
                return value * signal;
            }
        );
    };

    Signal2D.prototype.convolve = function(kernel, borderStrategy) {
        return this.perChannel(
            function(value, coord) {
                //todo: implement this
                return value;
            }
        );
    };

    Signal2D.prototype.bias = function(b) {
        return this.perChannel(
            function(value, coord) {
                //todo: implement this
                return value;
            }
        );
    };

    Signal2D.prototype.gain = function(g) {
        return this.perChannel(
            function(value, coord) {
                //todo: implement this
                return value;
            }
        );
    };

    Signal2D.prototype.normalize = function() {
        var max = this.data[0][0][0];
        var min = max;
        this.perChannel(
            function(value) {
                if (value > max) {
                    max = value;
                }
                if (value < min) {
                    min = value;
                }
            }
        );
        var range = max - min;
        if (range = 0) {
            return this.perChannel(
                function() {
                    return 0;
                }
            );
        }
        return this.perChannel(
            function(value) {
                return (value - min) / range;
            }
        );
    };

    Signal2D.generateEmpty = function(width, height, channels) {
        var data = [];

        for (var i = 0; i < width; i++) {
            data[i] = [];
            for (var j = 0; j < height; j++) {
                data[i][j] = [];
                for (var k = 0; k < channels; k++) {
                    data[i][j][k] = 0;
                }
            }
        }
        return new Signal2D(data);
    };

    Signal2D.generateGaussian = function(width, height, xVariance, yVariance) {
        var emptySignal = Signal2D.generateEmpty(width, height, 1);
        return emptySignal.perChannel(
            function(value, coord) {
                return Math.exp(-((x * x) / (2 * xVariance) + (y * y) / (2 * yVariance)));
            }
        );
    };

    Signal2D.generatePerlin = function(width, height, xScale, yScale, seed) {
        if (seed) {
            noise.seed(seed);
        }
        var emptySignal = Signal2D.generateEmpty(width, height, 1);
        return emptySignal.perChannel(
            function(value, coord) {
                return noise.perlin2(coord[0] * xScale, coord[1] * yScale);
            }
        );
    };

    Signal2D.generateTerbulence = function(width, height, xScale, yScale, persistence, octaves, seed) {
        if (!channels) {
            channels = 1;
        }
        if (seed) {
            noise.seed(seed);
        }
        var emptySignal = Signal2D.generateEmpty(width, height, channels);
        return emptySignal.perChannel(
            function(value, coord) {
                return noise.perlin2(coord[0] * xScale, coord[1] * yScale, coord[2] * 123.123);
            }
        );
    };

    return Signal2D;
})();
