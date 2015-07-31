var Multicontinent = (function () {
    var Multicontinent = function(seed, width, height) {
        Continent.call(this, seed, width, height);
        this.numContinents = 9;
        this.calibrationWidth = this.continentWidth * 2;
        this.calibrationHeight = this.continentHeight;
        this.continentWidth = 2 * this.continentWidth / Math.sqrt(this.numContinents);
        this.continentHeight = 1 * this.continentHeight / Math.sqrt(this.numContinents);

        this.continentWidth = Math.floor(this.continentWidth);
        this.continentHeight = Math.floor(this.continentHeight);
    };

    Multicontinent.prototype = Object.create(Continent.prototype);

    Multicontinent.prototype.generateContinentLocations = function() {
        var continentCoords = [];
        var gridDim = Math.ceil(Math.sqrt(this.numContinents));
        var used = [];

        console.log('' + this.numContinents + ', ' + gridDim * gridDim);

        Math.seedrandom('' + this.seed);
        var scale = 0.6;
        while (continentCoords.length < this.numContinents) {
            var x = Math.random();
            var y = Math.random();
            var cell = Math.floor(x * gridDim) + Math.floor(y * gridDim) * gridDim;
            if (used[cell]) {
                continue;
            }
            used[cell] = true;
            continentCoords.push([
                x * this.calibrationWidth * scale + (this.width - this.calibrationWidth * scale) / 2,
                y * this.calibrationHeight * scale + (this.height - this.calibrationHeight * scale) / 2
            ]);
        }
        return continentCoords;
    }

    Multicontinent.prototype.generateHeightMap = function() {
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
        processing.normalizeCalibrated(heightMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);

        this.continentCoords = this.generateContinentLocations();
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var gauss = 0;
                for (var k = 0; k < this.continentCoords.length; k++) {
                    var centerX = this.continentCoords[k][0];
                    var centerY = this.continentCoords[k][1];
                    gauss += processing.gaussian(centerX - i, centerY - j, 10 * this.continentWidth, 10 * this.continentHeight);
                }
                heightMap[i + j * this.width] *= gauss * 0.5;
            }
        }
        processing.normalizeCalibrated(heightMap, this.width, this.height, this.calibrationWidth, this.calibrationHeight);
        return heightMap;
    };

    // Multicontinent.prototype.render = function(canvas, display) {
    //     this.renderHeatMap(canvas, this.heightMap);
    // };

    return Multicontinent;
})();
