var Multicontinent = (function () {
    var Multicontinent = function(seed, width, height) {
        Continent.call(this, seed, width, height);
        this.numContinents = 5;
        this.calibrationWidth = this.continentWidth;
        this.calibrationHeight = this.continentHeight;
        this.continentWidth /= Math.sqrt(this.numContinents);
        this.continentHeight /= Math.sqrt(this.numContinents);
    };

    Multicontinent.prototype = Object.create(Continent.prototype);

    Multicontinent.prototype.generateHeightMap = function() {
        var heightMap = [];
        noise.seed(this.seed);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var cell = (i + j * this.width);
                var turbulence = processing.turbulence(5 * i / this.continentHeight, 5 * j / this.continentHeight, 0.5, 8);
                // turbulence = processing.gain(0.4, turbulence);
                heightMap[cell] = turbulence;
            }
        }
        processing.normalize(heightMap);

        var continentCoords = [];
        Math.seedrandom('' + this.seed);
        for (var i = 0; i < this.numContinents; i++) {
            continentCoords[i] = [
                Math.random() * this.calibrationWidth + (this.width - this.calibrationWidth) / 2,
                Math.random() * this.calibrationHeight + (this.height - this.calibrationHeight) / 2
            ];
        }

        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                var gauss = 0;
                for (var k = 0; k < continentCoords.length; k++) {
                    var centerX = continentCoords[k][0];
                    var centerY = continentCoords[k][1];
                    gauss += processing.gaussian(centerX - i, centerY - j, 20 * this.continentWidth, 20 * this.continentHeight);
                }
                heightMap[i + j * this.width] *= gauss * 0.5;
            }
        }
        processing.normalize(heightMap);
        return heightMap;
    };

    // Multicontinent.prototype.render = function(canvas, display) {
    //     this.renderHeatMap(canvas, this.heightMap);
    // };

    return Multicontinent;
})();
