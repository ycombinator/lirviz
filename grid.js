class Grid {
  constructor(canvas, spacing = 10) {
    this.ctx = canvas.getContext('2d');
    this.spacing = 10;
    this.render();
  }

  render() {
    var canvas = this.ctx.canvas;
    this.ctx.lineWidth = 0.25;
    this.ctx.strokeStyle = '#c0c0c0';

    // Establish canvas sides' positions
    var canvasLeft   = canvas.clientLeft;
    var canvasRight  = canvasLeft + canvas.clientWidth;
    var canvasTop    = canvas.clientTop;
    var canvasBottom = canvasTop + canvas.clientHeight;

    // Draw vertical lines in grid
    for (var position = canvasLeft + this.spacing; position < canvasRight; position += this.spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(position, canvasTop);
      this.ctx.lineTo(position, canvasBottom);
      this.ctx.stroke();
    }

    // Draw horizontal lines in grid
    for (var position = canvasTop + this.spacing; position < canvasBottom; position += this.spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(canvasLeft, position);
      this.ctx.lineTo(canvasRight, position);
      this.ctx.stroke();
    }
  }

  addInputPluginNode(name, topLeftX, topLeftY, width, height) {
    return new InputPluginNode(this.ctx, name, topLeftX, topLeftY, width, height);
  }

  addFilterPluginNode(name, topLeftX, topLeftY, width, height) {
    return new FilterPluginNode(this.ctx, name, topLeftX, topLeftY, width, height);
  }

  addIfNode(topLeftX, topLeftY, width, height) {
    return new IfNode(this.ctx, topLeftX, topLeftY, width, height);
  }

  addOutputPluginNode(name, topLeftX, topLeftY, width, height) {
    return new OutputPluginNode(this.ctx, name, topLeftX, topLeftY, width, height);
  }
}

Grid.makeWith = (ctx, spacing) => {
  return new Grid(ctx, spacing);
};
