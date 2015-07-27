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
                newData.push([]);
                for (var j = 0; j < data[0].length; j++) {
                    newData[i][j] = [data[i][j]];
                }
            }
            this.data = newData;
        }
    }

    Signal2D.prototype.perPixel = function(f, inProgressCallback, completeCallback) {
        var newData = [];
        var perc = 0;
        var i = 0;
        var data = this.data;

        var handleColumn = function() {
            if (i == data.length) {
                if (completeCallback) {
                    completeCallback(new Signal2D(newData));
                }
            } else {
                if (inProgressCallback) {
                    var temp = (i * data.length) / (data.length * data[0].length);
                    var newPerc = (temp - temp % 0.01) * 100;
                    if (perc !== newPerc) {
                        perc = newPerc;
                        inProgressCallback(newPerc);
                    }
                }
                newData.push([]);
                for (var j = 0; j < data[0].length; j++) {
                    newData[i][j] = f(data[i][j], [i, j]);
                }
                i++;
                setTimeout(handleColumn, 0);
            }
        };

        handleColumn();
    };

    Signal2D.prototype.perChannel = function(f, inProgressCallback, completeCallback) {
        this.perPixel(
            function (pix, coord) {
                var newPix = [];
                for (var k = 0; k < pix.length; k++) {
                    newPix.push(f(pix[k], [coord[0], coord[1], k]));
                }
                return newPix;
            }, inProgressCallback, completeCallback);
    };

    Signal2D.prototype.add = function(signal, inProgressCallback, completeCallback) {
        if (signal.data) {
            this.perChannel(
                function(value, coord) {
                    return value + signal.data[coord[0]][coord[1]][coord[2]];
                }, inProgressCallback, completeCallback
            );
        } else {
            this.perChannel(
                function(value, coord) {
                    return value + signal;
                }, inProgressCallback, completeCallback
            );
        }
    };

    Signal2D.prototype.multiply = function(signal, inProgressCallback, completeCallback) {
        if (signal.data) {
            this.perChannel(
                function(value, coord) {
                    return value * signal.data[coord[0]][coord[1]][coord[2]];
                }, inProgressCallback, completeCallback
            );
        } else {
            this.perChannel(
                function(value, coord) {
                    return value * signal;
                }, inProgressCallback, completeCallback
            );
        }
    };

    Signal2D.prototype.convolve = function(kernel, borderStrategy, inProgressCallback, completeCallback) {
        this.perChannel(
            function(value, coord) {
                //todo: implement this
                return value;
            }, inProgressCallback, completeCallback
        );
    };

    Signal2D.prototype.bias = function(b, inProgressCallback, completeCallback) {
        this.perChannel(
            function(value, coord) {
                //todo: implement this
                return value;
            }, inProgressCallback, completeCallback
        );
    };

    Signal2D.prototype.gain = function(g, inProgressCallback, completeCallback) {
        this.perChannel(
            function(value, coord) {
                //todo: implement this
                return value;
            }, inProgressCallback, completeCallback
        );
    };

    Signal2D.prototype.normalize = function(inProgressCallback, completeCallback) {
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
            this.perChannel(
                function() {
                    return 0;
                }, inProgressCallback, completeCallback
            );
        } else {
            this.perChannel(
                function(value) {
                    return (value - min) / range;
                }, inProgressCallback, completeCallback
            );
        }
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

    Signal2D.generateGaussian = function(width, height, xVariance, yVariance, inProgressCallback, completeCallback) {
        var emptySignal = Signal2D.generateEmpty(width, height, 1);
        emptySignal.perChannel(
            function(value, coord) {
                var x = coord[0] - width / 2;
                var y = coord[1] - height / 2;
                return Math.exp(-((x * x) / (2 * xVariance) + (y * y) / (2 * yVariance)));
            }, inProgressCallback, completeCallback
        );
    };

    Signal2D.generatePerlin = function(width, height, xScale, yScale, seed, inProgressCallback, completeCallback) {
        if (seed) {
            noise.seed(seed);
        }
        var emptySignal = Signal2D.generateEmpty(width, height, 1);
        emptySignal.perChannel(
            function(value, coord) {
                return noise.perlin2(coord[0] * xScale, coord[1] * yScale);
            }, inProgressCallback, completeCallback
        );
    };

    Signal2D.generateTerbulence = function(width, height, xScale, yScale, persistence, octaves, seed, inProgressCallback, completeCallback) {
        if (seed) {
            noise.seed(seed);
        }
        var emptySignal = Signal2D.generateEmpty(width, height, 1);
        emptySignal.perChannel(
            function(value, coord) {
                //todo: do this correctly
                return noise.perlin2(coord[0] * xScale, coord[1] * yScale);
            }, inProgressCallback, completeCallback
        );
    };

    return Signal2D;
})();
