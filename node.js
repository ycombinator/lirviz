const CURVE_RADIUS = 10;
const IO_RADIUS = 5;

class Node {
  constructor(topLeftX, topLeftY, width, height, inputs, outputs) {
    this.topLeftX = topLeftX;
    this.topLeftY = topLeftY;
    this.width    = width;
    this.height   = height;

    this.inputs = {};
    inputs.forEach(input => {
      this.inputs[input] = null; // Will be replaced with position of input later when it is rendered
    });

    this.outputs = {};
    outputs.forEach(output => {
      this.outputs[output] = null; // Will be replaced with position of output later when it is rendered
    });

    this.render();
  }

  render() {
    var bottomRightX = this.topLeftX + this.width;
    var bottomRightY = this.topLeftY + this.height;

    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#444';
    ctx.fillStyle = '#ddd';

    // Top left corner + top line
    ctx.moveTo(this.topLeftX, this.topLeftY + CURVE_RADIUS);
    ctx.quadraticCurveTo(this.topLeftX, this.topLeftY, this.topLeftX + CURVE_RADIUS, this.topLeftY);
    ctx.lineTo(bottomRightX - CURVE_RADIUS, this.topLeftY);

    // Top right corner + right line
    ctx.quadraticCurveTo(bottomRightX, this.topLeftY, bottomRightX, this.topLeftY + CURVE_RADIUS);
    ctx.lineTo(bottomRightX, bottomRightY - CURVE_RADIUS);

    // Bottom right corner + bottom line
    ctx.quadraticCurveTo(bottomRightX, bottomRightY, bottomRightX - CURVE_RADIUS, bottomRightY);
    ctx.lineTo(this.topLeftX + CURVE_RADIUS, bottomRightY);

    // Bottom left corner + left line
    ctx.quadraticCurveTo(this.topLeftX, bottomRightY, this.topLeftX, bottomRightY - CURVE_RADIUS);
    ctx.lineTo(this.topLeftX, this.topLeftY + CURVE_RADIUS);

    ctx.stroke();
    ctx.fill();

    var _drawIOs = (positions, ioX, initY) => {
      const numIO = Object.keys(positions).length;
      const ioYSpacing = ( bottomRightY - CURVE_RADIUS - ( this.topLeftY + CURVE_RADIUS ) ) / ( numIO + 1 );
      var ioNumber = 1;
      for (const positionLabel in positions) {
        var ioY = initY + (ioNumber * ioYSpacing);

        ctx.beginPath();
        ctx.arc(ioX, ioY, IO_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fill();

        // Save position
        positions[positionLabel] = { x: ioX, y: ioY };

        if (numIO > 1) {
          ctx.fillStyle = '#444';
          ctx.font = '0.1em sans-serif';
          ctx.fillText(positionLabel, ioX - 3, ioY + 3);
        }

        ++ioNumber;
      }
    }

    // Draw inputs
    _drawIOs(this.inputs, this.topLeftX, this.topLeftY + CURVE_RADIUS);

    // Draw outputs
    _drawIOs(this.outputs, bottomRightX, this.topLeftY + CURVE_RADIUS);
  }

  connect(outputNumber, targetNode) {
    if (arguments.length === 1) { // Only targetNode is specified
      targetNode = outputNumber
      outputNumber = Node.OUTPUT_DEFAULT;
    }
    var output = this.outputs[outputNumber];
    var input  = targetNode.inputs[Node.INPUT_DEFAULT];
    drawEdge(output.x + IO_RADIUS, output.y, input.x - IO_RADIUS, input.y)
  }
}

Node.INPUT_DEFAULT  = 1;
Node.OUTPUT_DEFAULT = 1;

class PluginNode extends Node {
  constructor(topLeftX, topLeftY, width, height) {
    super(topLeftX, topLeftY, width, height, [ Node.INPUT_DEFAULT ], [ Node.OUTPUT_DEFAULT ]);
  }
}

class IfNode extends Node {
  constructor(topLeftX, topLeftY, width, height) {
    super(topLeftX, topLeftY, width, height, [ Node.INPUT_DEFAULT ], [ IfNode.OUTPUT_TRUE, IfNode.OUTPUT_FALSE ]);
  }
}

IfNode.OUTPUT_TRUE = 'T';
IfNode.OUTPUT_FALSE = 'F';
