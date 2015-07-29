
var Continent = (function() {
    var Continent = function(seed, width, height) {
        this.seed = seed;
        this.width = width;
        this.height = height;
        this.continentWidth = width;
        this.continentHeight = height;
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
                var turbulence = processing.turbulence(5 * i / this.continentHeight, 5 * j / this.continentHeight, 0.5, 8);
                turbulence = processing.gain(0.4, turbulence);
                heightMap[cell] = turbulence;
            }
        }
        processing.normalize(heightMap);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var x = i - this.width / 2;
                var y = j - this.height / 2;
                var gauss = processing.gaussian(x, y, 30 * this.continentWidth, 30 * this.continentHeight) * 0.80 + 0.15;
                heightMap[cell] *= gauss;
            }
        }
        processing.normalize(heightMap);
        return heightMap;
    };

    Continent.prototype.generateTemperatureMap = function() {
        var temperatureMap = [];
        noise.seed((this.seed + 0.1) % 1);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 8);
                // turbulence = processing.bias(0.7, turbulence);
                temperatureMap[cell] = turbulence;
            }
        }
        processing.normalize(temperatureMap);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var y = j - this.height / 2;
                var gauss = processing.gaussian(0, y, 1, 30 * this.continentHeight);
                temperatureMap[cell] = processing.bias(0.65, temperatureMap[cell]) * gauss;
            }
        }
        processing.normalize(temperatureMap);
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
        processing.normalize(moistureMap);
        noise.seed((this.seed + 0.2) % 1);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var turbulence = processing.turbulence(0.01 * i, 0.01 * j, 0.5, 8);
                // turbulence = processing.bias(0.7, turbulence);
                moistureMap[cell] += turbulence;
            }
        }
        processing.normalize(moistureMap);
        return moistureMap;
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
        // this.oceanMask = this.generateOceanMask();
        // this.shoreMask = this.generateShoreMask();
        return this;
    };

    Continent.prototype.render = function(canvas, display) {

        switch (display) {
            case 'map':
                this.renderMap(canvas);
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
        }
        return this;
    };

    return Continent;
})();
