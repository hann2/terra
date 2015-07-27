
function renderSignalToCanvas(canvas, signal) {
    var ctx = canvas.getContext('2d');

    var image = ctx.createImageData(signal.width, signal.height);
    var data = image.data;

    signal.perPixel(
        function(pix, coord) {
            var cell = (coord[0] + coord[1] * signal.width) * 4;
            // rgb
            if (pix.length == 1) {
                data[cell] = data[cell + 1] = data[cell + 2] = pix[0];
            } else {
                for (var k = 0; k < 3; k++) {
                    data[cell + k] = pix[k];
                }
            }
            //alpha
            if (pix.length == 4) {
                data[cell + 3] = pix[3];
            } else {
                data[cell + 3] = 255;
            }
        }, null, function() {
            ctx.fillColor = 'black';
            ctx.fillRect(0, 0, 100, 100);
            ctx.putImageData(image, 0, 0);
        }
    );
}

