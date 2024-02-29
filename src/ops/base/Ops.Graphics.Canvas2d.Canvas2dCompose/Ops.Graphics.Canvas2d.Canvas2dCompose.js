const canv = document.createElement("canvas");
const
    exec = op.inTrigger("Exec"),
    inCanvas = op.inObject("Canvas Copy", null, "element"),
    inWidth = op.inInt("Width", 256),
    inHeight = op.inInt("Height", 256),
    next = op.outTrigger("Next"),
    outEle = op.outObject("Element", canv, "element");

canv.width = canv.height = 256;

const ctx = canv.getContext("2d");

inWidth.onChange =
inHeight.onChange = () =>
{
    canv.width = inWidth.get();
    canv.height = inHeight.get();
};

exec.onTriggered = () =>
{
    op.patch.frameStore.canvasCompose = { "canvas": canv, "ctx": ctx };

    ctx.clearRect(0, 0, inWidth.get(), inHeight.get());
    ctx.fillStyle = "grey";
    ctx.antiAlias = true;

    if (inCanvas.get() && inCanvas.get().width > 0 && inCanvas.get().height > 0)ctx.drawImage(inCanvas.get(), 0, 0);

    next.trigger();
    op.patch.frameStore.canvasCompose = null;
    outEle.setRef(canv);
};
