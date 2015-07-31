
var Continent = (function() {
    var Continent = function(seed, width, height) {
        this.seed = seed;
        this.width = width;
        this.height = height;
        this.continentWidth = 512;
        this.continentHeight = 512;
        this.calibrationWidth = this.continentWidth;
        this.calibrationHeight = this.continentHeight;
        this.waterLevel = 0.2;
    };

    Continent.prototype.isEqual = function(continent) {
        return continent &&
            continent.seed === this.seed &&
            continent.width === this.width &&
            continent.height === this.height;
    };

    var getContinentColor = function(height, waterLevel) {
        if (height > 0.9) {
            return [255, 250, 250]; //white
        } else if (height > 0.8) {
            return [139, 137, 137]; //grey
        } else if (height > 0.7) {
            return [139, 119, 101]; //brown
        } else if (height > 0.4) {
            return [0, 100, 0];     //dark green
        } else if (height > 0.25) {
            return [50, 205, 50];   //light green
        } else if (height > waterLevel) {
            return [238, 232, 170]; //tan
        } else {
            return [65, 105, 225];  //blue
        }
    };

    Continent.prototype.renderMap = function(canvas) {
        var imageData = [];
        for (var i = 0; i < this.heightMap.length; i++) {
            var dataCell = i;
            var imageCell = i * 4;
            var elevation = this.heightMap[dataCell];
            var color = getContinentColor(elevation, this.waterLevel);
            imageData[imageCell] = color[0];
            imageData[imageCell + 1] = color[1];
            imageData[imageCell + 2] = color[2];
            imageData[imageCell + 3] = 256;
        }
        renderImageToCanvas(canvas, imageData, this.width, this.height);
    };

    Continent.prototype.getContinentColor = function(dataCell) {
        var height = this.heightMap[dataCell];
        var temperature = this.temperatureMap[dataCell];
        var moisture = this.moistureMap[dataCell];

        var colorTerms = [];

        if (temperature < 0.01) {
            return [255, 250, 250];
        } else if (height <= this.waterLevel) {
            return [65, 105, 225];
        }

        if (temperature < 0.25) {
            colorTerms.push([238, 233, 233, (0.25 - temperature) * 20]); //off-white
        }

        if (height > 0.85) {
            var range = 1 - 0.85;
            var ratio = (height - 0.85) / range;
            colorTerms.push([255, 250, 250, ratio]); //white
            colorTerms.push([139, 137, 137, 1 - ratio]); //grey
        } else if (height > 0.75) {
            var range = 0.85 - 0.75;
            var ratio = (height - 0.75) / range;
            colorTerms.push([139, 137, 137, ratio]); //grey
            colorTerms.push([139, 119, 101, 1 - ratio]); //brown
        } else if (height > 0.6) {
            var range = 0.75 - 0.6;
            var ratio = (height - 0.6) / range;
            colorTerms.push([139, 119, 101, ratio]); //brown
            colorTerms.push([0, 100, 0, 1 - ratio]);     //dark green
        } else if (height > 0.25) {
            var range = 0.6 - 0.25;
            var ratio = (height - 0.25) / range
            colorTerms.push([0, 100, 0, ratio]);     //dark green
            colorTerms.push([50, 205, 50, (1 - ratio)]);   //light green
        } else if (height > 0.22) {
            colorTerms.push([50, 205, 50, 1]);   //light green
        } else {
            colorTerms.push([238, 232, 170, 1]); //tan
        }

        var color = [0, 0, 0, 0];
        for (var i = 0; i < colorTerms.length; i++) {
            color[0] += colorTerms[i][3] * colorTerms[i][0];
            color[1] += colorTerms[i][3] * colorTerms[i][1];
            color[2] += colorTerms[i][3] * colorTerms[i][2];
            color[3] += colorTerms[i][3];
        }
        return [color[0] / color[3], color[1] / color[3], color[2] / color[3]];
    };

    Continent.prototype.renderMap2 = function(canvas) {
        var imageData = [];
        for (var i = 0; i < this.heightMap.length; i++) {
            var dataCell = i;
            var imageCell = i * 4;
            var elevation = this.heightMap[dataCell];
            var color = this.getContinentColor(dataCell);
            imageData[imageCell] = color[0];
            imageData[imageCell + 1] = color[1];
            imageData[imageCell + 2] = color[2];
            imageData[imageCell + 3] = 256;
        }
        renderImageToCanvas(canvas, imageData, this.width, this.height);
    };

    var getHeatColor = function(temperature) {
        if (temperature > 0.5) {
            scale = (temperature - 0.5) * 2;
            return [256 * scale, 256 * (1 - scale), 0];
        } else {
            scale = temperature * 2;
            return [0, 256 * scale, 256 * (1 - scale)];
        }
    };

    Continent.prototype.renderHeatMap = function(canvas, map) {
        var imageData = [];
        for (var i = 0; i < map.length; i++) {
            var dataCell = i;
            var imageCell = i * 4;
            var temperature = map[dataCell];
            var color = getHeatColor(temperature);
            imageData[imageCell] = color[0];
            imageData[imageCell + 1] = color[1];
            imageData[imageCell + 2] = color[2];
            imageData[imageCell + 3] = 256;
        }
        renderImageToCanvas(canvas, imageData, this.width, this.height);
    };

    Continent.prototype.renderTopographical = function(canvas) {
        var imageData = [];
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var imageCell = (i + j * this.width) * 4;
                var levels = 5;
                var elevation = Math.floor(this.heightMap[i + j * this.width] * levels);
                var height2 = Math.floor(this.heightMap[i + 1 + j * this.width] * levels);
                var height3 = Math.floor(this.heightMap[i + (j + 1) * this.width] * levels);
                var height4 = Math.floor(this.heightMap[i + 1 + (j + 1) * this.width] * levels);

                var heightDiffers = elevation !== height2 || elevation !== height3 || elevation !== height4;

                if (i !== (this.width - 1) && j !== (this.height - 1) && heightDiffers) {
                    color = [0, 0, 0];
                } else if (elevation > this.waterLevel) {
                    color = [238, 232, 170];
                } else {
                    color = [65, 105, 225];
                }

                imageData[imageCell] = color[0];
                imageData[imageCell + 1] = color[1];
                imageData[imageCell + 2] = color[2];
                imageData[imageCell + 3] = 256;
            }
        }
        renderImageToCanvas(canvas, imageData, this.width, this.height);
    };

    Continent.prototype.renderParchment = function(canvas) {
        var imageData = [];
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var imageCell = (i + j * this.width) * 4;
                var elevation = this.heightMap[i + j * this.width];
                var height2 = this.heightMap[i + 1 + j * this.width];
                var height3 = this.heightMap[i + (j + 1) * this.width];
                var height4 = this.heightMap[i + 1 + (j + 1) * this.width];

                var heightDiffers = (elevation <= this.waterLevel && (height2 > this.waterLevel || height3 > this.waterLevel || height4 > this.waterLevel))
                                 || (elevation >= this.waterLevel && (height2 < this.waterLevel || height3 < this.waterLevel || height4 < this.waterLevel));

                if (i !== (this.width - 1) && j !== (this.height - 1) && heightDiffers) {
                    color = [0, 0, 0];
                } else if (elevation > this.waterLevel) {
                    color = [238, 232, 170];
                } else {
                    // color = [65, 105, 225];
                    var scale = 0.8;
                    color = [238 * scale, 232 * scale, 170 * scale];
                }

                imageData[imageCell] = color[0];
                imageData[imageCell + 1] = color[1];
                imageData[imageCell + 2] = color[2];
                imageData[imageCell + 3] = 256;
            }
        }
        renderImageToCanvas(canvas, imageData, this.width, this.height);
    };

    Continent.prototype.generateHeightMap = function() {
        var heightMap = [];
        noise.seed(this.seed);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var x = i - this.width / 2;
                var y = j - this.height / 2;
                var turbulence = processing.turbulence(5 * x / this.continentHeight, 5 * y / this.continentHeight, 0.5, 8);
                turbulence = processing.gain(0.4, turbulence);
                heightMap[cell] = turbulence;
            }
        }
        processing.normalizeCalibrated(heightMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var x = i - this.width / 2;
                var y = j - this.height / 2;
                var gauss = processing.gaussian(x, y, 30 * this.continentWidth, 30 * this.continentHeight) * 0.80 + 0.15;
                heightMap[cell] *= gauss;
            }
        }
        processing.normalizeCalibrated(heightMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        return heightMap;
    };

    Continent.prototype.generateTemperatureMap = function() {
        var temperatureMap = [];
        noise.seed((this.seed + 0.1) % 1);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 4);
                // turbulence = processing.bias(0.7, turbulence);
                temperatureMap[cell] = turbulence;
            }
        }
        processing.normalizeCalibrated(temperatureMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var y = j - this.height / 2;
                var gauss = processing.gaussian(0, y, 1, 30 * this.continentHeight);
                temperatureMap[cell] = (temperatureMap[cell] + gauss) * gauss;
            }
        }
        processing.normalizeCalibrated(temperatureMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        return temperatureMap;
    };

    Continent.prototype.generateMoistureMap = function() {
        var moistureMap = [];

        var rainBudget = 100;
        var highestReached = [];
        for (var j = 0; j < this.height; j++) {
            highestReached[j] = 0;
        }
        for (var i = 0; i < this.heightMap.length; i++) {
            moistureMap[i] = 0;
        }
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {
                var elevation = Math.floor(this.heightMap[i + j * this.width] * rainBudget);

                if (elevation > highestReached[j]) {
                    var rainUnits = elevation - highestReached[j];
                    highestReached[j] = elevation;
                    if (rainUnits > 0 && elevation > this.waterLevel) {
                        for (var k = 0; k < 100; k++) {
                            if ((i - k) >= 0) {
                                moistureMap[(i - k) + j * this.width] += processing.gaussian(0, k, 1, 2 * this.continentWidth);
                            }
                        }
                    }
                }
            }
        }
        processing.normalizeCalibrated(moistureMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        noise.seed((this.seed + 0.2) % 1);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 8);
                // turbulence = processing.bias(0.7, turbulence);
                moistureMap[cell] += turbulence;
            }
        }

        var smoothMoistureData = [];
        var kernelSize = 2;
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                if (this.heightMap[i + j * this.width] < this.waterLevel) {
                    smoothMoistureData[i + j * this.width] = moistureMap[i + j * this.width];
                    continue;
                }
                var sum = 0;
                var weightSum = 0;
                for (var l = -kernelSize; l <= kernelSize; l++) {
                    for (var m = -kernelSize; m <= kernelSize; m++) {
                        var x = i + l;
                        var y = j + m;
                        if (x < 0 || y < 0 || x >= this.width || y >= this.height ||
                                this.heightMap[x + y * this.width] < this.waterLevel) {
                            continue;
                        }
                        var gauss = processing.gaussian(l, m, 3, 3);
                        weightSum += gauss;
                        sum += gauss * moistureMap[x + y * this.width];
                    }
                }
                smoothMoistureData[i + j * this.width] = sum / weightSum;
            }
        }

        processing.normalizeCalibrated(smoothMoistureData, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        return smoothMoistureData;
    };

    Continent.prototype.dropRain = function(rainAmount, x, y, riverMap) {
        var minHeight = this.heightMap[x + y * this.width];
        if (minHeight < this.waterLevel) {
            return;
        }
        var minX = x;
        var minY = y;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (this.heightMap[(x + i) + (y + j) * this.width] < minHeight) {
                    minX = x + i;
                    minY = y + j;
                    minHeight = this.heightMap[minX + minY * this.width];
                }
            }
        }
        riverMap[x + y * this.width] += rainAmount;
        if (minX === x && minY === y) {
            //local minima
        } else {
            this.dropRain(rainAmount, minX, minY, riverMap);
        }
    }

    Continent.prototype.generateRiverMap = function() {
        var riverMap = [];
        for (var i = 0; i < this.width * this.height; i++) {
            riverMap[i] = 0;
        }

        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.dropRain(this.moistureMap[i + j * this.width], i, j, riverMap);
            }
        }

        processing.normalizeCalibrated(riverMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        for (var i = 0; i < this.width * this.height; i++) {
            riverMap[i] = Math.sqrt(Math.sqrt(Math.sqrt(riverMap[i])));
        }
        return riverMap;
    };

    var continentCache = {};
    Continent.prototype.generate = function(canvas) {
        if (this.isEqual(continentCache)) {
            return continentCache;
        }
        continentCache = this;

        this.heightMap = this.generateHeightMap();
        this.temperatureMap = this.generateTemperatureMap();
        this.moistureMap = this.generateMoistureMap();
        this.riverMap = this.generateRiverMap();
        return this;
    };

    Continent.prototype.render = function(canvas, display) {

        switch (display) {
            case 'map':
                this.renderMap2(canvas);
                break;
            case 'topo':
                this.renderTopographical(canvas);
                break;
            case 'parchment':
                this.renderParchment(canvas);
                break;
            case 'temperature':
                this.renderHeatMap(canvas, this.temperatureMap);
                break;
            case 'moisture':
                this.renderHeatMap(canvas, this.moistureMap);
                break;
            case 'river':
                this.renderHeatMap(canvas, this.riverMap);
                break;
        }
        return this;
    };

    return Continent;
})();
