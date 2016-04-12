var cgl=op.patch.cgl;

this.name='letterbox';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

// this.offX=this.addOutPort(new Port(this,"offset x",OP_PORT_TYPE_VALUE));
// this.offY=this.addOutPort(new Port(this,"offset y",OP_PORT_TYPE_VALUE));

var ratio=this.addInPort(new Port(this,"ratio",OP_PORT_TYPE_VALUE ,{display:'dropdown',values:[1.25,1.3333333333,1.777777777778,2.33333333333333,3]} ));
ratio.set(1.777777777778);

var blackBars=this.addInPort(new Port(this,"black bars",OP_PORT_TYPE_VALUE,{display:'bool'}));
blackBars.set(true);

var x=0,y=0,w=1000,h=1000;


function resize()
{
    var _w=cgl.canvasHeight*ratio.get();
    var _h=cgl.canvasHeight;
    var _x=0;
    var _y=0;
    if(_w>cgl.canvasWidth)
    {
       _w=cgl.canvasWidth;
       _h=cgl.canvasWidth/ratio.get();
    }

    if(_w<cgl.canvasWidth) _x=(cgl.canvasWidth-_w)/2;
    if(_h<cgl.canvasHeight) _y=(cgl.canvasHeight-_h)/2;


    if(_w!=w || _h!=h || _x!=x ||_y!=y)
    {
        w=_w;
        h=_h;
        x=_x;
        y=_y;

        cgl.setViewPort(x,y,w,h);

        for(var i=0;i<op.patch.ops.length;i++)
        {
            if(op.patch.ops[i].onResize)op.patch.ops[i].onResize();
        }
    }
}

this.onDelete=function()
{
    // cgl.gl.disable(cgl.gl.SCISSOR_TEST);
    cgl.resetViewPort();
}

render.onTriggered=function()
{
    if(blackBars.get())
    {
        cgl.gl.clearColor(0,0,0,1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    resize();

    x=Math.round(x);
    y=Math.round(y);
    w=Math.round(w+0.5);
    h=Math.round(h+0.5);

    cgl.gl.scissor(x,y,w,h);
    cgl.setViewPort(x,y,w,h);
    
    mat4.perspective(cgl.pMatrix,45, ratio.get(), 0.1, 1100.0);


    trigger.trigger();

};
