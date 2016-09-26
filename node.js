const CURVE_RADIUS = 10;
const IO_RADIUS = 6;

class Node {
  constructor(ctx, topLeftX, topLeftY, width, height, inputs, outputs) {
    this.ctx      = ctx;
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

    this.ctx.beginPath();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = '#444';
    this.ctx.fillStyle = '#ddd';

    // Top left corner + top line
    this.ctx.moveTo(this.topLeftX, this.topLeftY + CURVE_RADIUS);
    this.ctx.quadraticCurveTo(this.topLeftX, this.topLeftY, this.topLeftX + CURVE_RADIUS, this.topLeftY);
    this.ctx.lineTo(bottomRightX - CURVE_RADIUS, this.topLeftY);

    // Top right corner + right line
    this.ctx.quadraticCurveTo(bottomRightX, this.topLeftY, bottomRightX, this.topLeftY + CURVE_RADIUS);
    this.ctx.lineTo(bottomRightX, bottomRightY - CURVE_RADIUS);

    // Bottom right corner + bottom line
    this.ctx.quadraticCurveTo(bottomRightX, bottomRightY, bottomRightX - CURVE_RADIUS, bottomRightY);
    this.ctx.lineTo(this.topLeftX + CURVE_RADIUS, bottomRightY);

    // Bottom left corner + left line
    this.ctx.quadraticCurveTo(this.topLeftX, bottomRightY, this.topLeftX, bottomRightY - CURVE_RADIUS);
    this.ctx.lineTo(this.topLeftX, this.topLeftY + CURVE_RADIUS);

    this.ctx.stroke();
    this.ctx.fill();

    var _drawIOs = (positions, ioX, initY) => {
      const numIO = Object.keys(positions).length;
      const ioYSpacing = ( bottomRightY - CURVE_RADIUS - ( this.topLeftY + CURVE_RADIUS ) ) / ( numIO + 1 );
      var ioNumber = 1;
      for (const positionLabel in positions) {
        var ioY = initY + (ioNumber * ioYSpacing);

        this.ctx.beginPath();
        this.ctx.arc(ioX, ioY, IO_RADIUS, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.fill();

        // Save position
        positions[positionLabel] = { x: ioX, y: ioY };

        if (numIO > 1) {
          this.ctx.fillStyle = '#444';
          this.ctx.font = '0.1em sans-serif';
          this.ctx.fillText(positionLabel, ioX - 3, ioY + 3);
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
    _drawEdge(this.ctx, output.x + IO_RADIUS, output.y, input.x - IO_RADIUS, input.y)
  }
}

Node.INPUT_DEFAULT  = 1;
Node.OUTPUT_DEFAULT = 1;

class PluginNode extends Node {
  constructor(ctx, topLeftX, topLeftY, width, height) {
    super(ctx, topLeftX, topLeftY, width, height, [ Node.INPUT_DEFAULT ], [ Node.OUTPUT_DEFAULT ]);
  }
}

class IfNode extends Node {
  constructor(ctx, topLeftX, topLeftY, width, height) {
    super(ctx, topLeftX, topLeftY, width, height, [ Node.INPUT_DEFAULT ], [ IfNode.OUTPUT_TRUE, IfNode.OUTPUT_FALSE ]);
  }
}

IfNode.OUTPUT_TRUE = 'T';
IfNode.OUTPUT_FALSE = 'F';

function _drawEdge(ctx, fromX, fromY, toX, toY) {

  // Make space for arrowhead
  toX = toX - 20;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#555';
  ctx.fillStyle = ctx.strokeStyle;

  // Determine control points
  control1X = (fromX + toX) * 0.6;
  control1Y = fromY; // (fromY + toY) / 2;

  control2X = (fromX + toX) * 0.4;
  control2Y = toY; // (fromY + toY) / 2;

  // Arrow curve
  ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, toX, toY);
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX, toY - 10); // Up
  ctx.lineTo(toX + 20, toY); // Right + down
  ctx.lineTo(toX, toY + 10); // Left + down
  ctx.lineTo(toX, toY); // Up
  ctx.fill();
}
