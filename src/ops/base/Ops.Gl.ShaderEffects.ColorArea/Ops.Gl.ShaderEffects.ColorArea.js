op.name="ColorArea";

var cgl=op.patch.cgl;
var id='mod'+Math.floor(Math.random()*10000);

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inSize=op.inValue("Size",1);


var inAmount=op.inValueSlider("Amount",0.5);


{
    // rgba colors
    
    var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
    r.set(Math.random());
    
    var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range'}));
    g.set(Math.random());
    
    var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.set(Math.random());

}

{
    // position

    var x=op.inValue("x");
    var y=op.inValue("y");
    var z=op.inValue("z");

}


var shader=null;

var srcHeadVert=''
    .endl()+'varying vec4 MOD_areaPos;'
    .endl();

var srcBodyVert=''
    .endl()+'MOD_areaPos=modelMatrix*pos;'
    .endl();

var srcHeadFrag=''
    .endl()+'varying vec4 MOD_areaPos;'
    .endl()+'uniform float MOD_size;'
    .endl()+'uniform float MOD_amount;'
    
    .endl()+'uniform float MOD_r;'
    .endl()+'uniform float MOD_g;'
    .endl()+'uniform float MOD_b;'

    .endl()+'uniform float MOD_x;'
    .endl()+'uniform float MOD_y;'
    .endl()+'uniform float MOD_z;'

    .endl();

var srcBodyFrag=''
    .endl()+'   float MOD_de=distance(vec3(MOD_x,MOD_y,MOD_z),MOD_areaPos.xyz);'
    .endl()+'   MOD_de=1.0-smoothstep(0.0,MOD_size,MOD_de);'
    .endl()+'   col.rgb=mix(col.rgb,vec3(MOD_r,MOD_g,MOD_b), MOD_de*MOD_amount);'
    .endl();


var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        moduleFrag=shader.addModule(
            {
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            },moduleVert);
            
        inSize.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'size',inSize);
        inAmount.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);

        r.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'r',r);
        g.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'g',g);
        b.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'b',b);

        x.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'z',z);


    }
    
    
    if(!shader)return;
    var texSlot=moduleVert.num+5;

    op.trigger.trigger();
};













