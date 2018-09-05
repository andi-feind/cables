var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var enableDepth=op.addInPort(new Port(op,"enable depth testing",OP_PORT_TYPE_VALUE,{ display:'bool' }));
enableDepth.set(true);

var fill=op.addInPort(new Port(op,"fill",OP_PORT_TYPE_VALUE,{ display:'bool' }));
fill.set(true);

function setDefines()
{
    if(shader)
        if(fill.get()) shader.define('WIREFRAME_FILL');
            else shader.removeDefine('WIREFRAME_FILL');
}
fill.onChange=function()
{
    setDefines();
};

var w=op.addInPort(new Port(op,"width",OP_PORT_TYPE_VALUE,{ display:'range' }));
w.set(0.25);
w.onValueChanged=function(){ uniformWidth.setValue(w.get()); };

var opacity=op.addInPort(new Port(op,"opacity",OP_PORT_TYPE_VALUE,{ display:'range' }));
opacity.set(1.0);
opacity.onValueChanged=function(){ uniformOpacity.setValue(opacity.get()); };

if(cgl.glVersion==1 && !cgl.gl.getExtension('OES_standard_derivatives') )
{
    op.uiAttr( { 'error': 'no oes standart derivatives!' } );
}
else
{
    op.uiAttr( { 'error': null } );
}




var doRender=function()
{
    // if(true!==enableDepth.get()) cgl.gl.disable(cgl.gl.DEPTH_TEST);
        // else cgl.gl.enable(cgl.gl.DEPTH_TEST);
    cgl.pushDepthTest(enableDepth.get());

    cgl.setShader(shader);
    trigger.trigger();
    cgl.setPreviousShader();

    // if(true!==enableDepth.get()) cgl.gl.enable(cgl.gl.DEPTH_TEST);
    cgl.popDepthTest();

};

var shader=new CGL.Shader(cgl,'Wireframe Material');

if(cgl.glVersion>1)shader.glslVersion=300;
var uniformWidth=new CGL.Uniform(shader,'f','width',w.get());
var uniformOpacity=new CGL.Uniform(shader,'f','opacity',opacity.get());

if(cgl.glVersion==1)shader.enableExtension('OES_standard_derivatives');

shader.setSource(attachments.wireframe_vert||'',attachments.wireframe_frag||'');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.wireframe=true;
setDefines();

{
    // diffuse color

    var r=op.addInPort(new Port(op,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    r.onValueChanged=function()
    {
        if(!r.uniform) r.uniform=new CGL.Uniform(shader,'f','r',r.get());
        else r.uniform.setValue(r.get());
    };

    var g=op.addInPort(new Port(op,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    g.onValueChanged=function()
    {
        if(!g.uniform) g.uniform=new CGL.Uniform(shader,'f','g',g.get());
        else g.uniform.setValue(g.get());
    };

    var b=op.addInPort(new Port(op,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.onValueChanged=function()
    {
        if(!b.uniform) b.uniform=new CGL.Uniform(shader,'f','b',b.get());
        else b.uniform.setValue(b.get());
    };

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
}

{
    // diffuse color

    var fr=op.addInPort(new Port(op,"Fill R",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    fr.uniform=new CGL.Uniform(shader,'f','fr',fr);

    var fg=op.addInPort(new Port(op,"Fill G",OP_PORT_TYPE_VALUE,{ display:'range' }));
    fg.uniform=new CGL.Uniform(shader,'f','fg',fg);

    var fb=op.addInPort(new Port(op,"Fill B",OP_PORT_TYPE_VALUE,{ display:'range' }));
    fb.uniform=new CGL.Uniform(shader,'f','fb',fb);

    fr.set(0);
    fg.set(0);
    fb.set(0);
}


//op.onLoaded=shader.compile;

render.onTriggered=doRender;

doRender();
