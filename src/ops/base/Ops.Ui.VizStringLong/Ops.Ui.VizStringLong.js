const
    inStr = op.inStringEditor("String"),
    inZoomText = op.inBool("ZoomText", false),
    inLineNums = op.inBool("Line Numbers", true),
    inFontSize = op.inFloat("Font Size", 10),
    inPos = op.inFloatSlider("Scroll", 0);

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });
inStr.ignoreValueSerialize = true;

let lines = [];

inStr.onLinkChanged = () =>
{
    if (!inStr.isLinked())
    {
        lines = [];
        inStr.set(null);
    }
};

inStr.onChange = () =>
{
    if (inStr.get()) lines = inStr.get().split("\n");
    else lines = [];
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    if (!inStr.get()) return;

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    viz.renderText(ctx, layer, lines, {
        "zoomText": inZoomText.get(),
        "showLineNum": inLineNums.get(),
        "fontSize": inFontSize.get(),
        "scroll": inPos.get()
    });

    ctx.restore();
};
