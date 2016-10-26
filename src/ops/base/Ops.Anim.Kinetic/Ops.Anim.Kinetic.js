op.name="Kinetic";

var value=op.inValue("Value",0);
var smoothSpeed=op.inValue("Speed",0.5);
var result=op.outValue("Result");

var firstTime=true;
var smoothInterval=0;

var anim=new CABLES.TL.Anim();
anim.defaultEasing=CABLES.TL.EASING_EXPO_OUT;
var startTime=op.patch.freeTimer.get();

function updateSmooth()
{
    var v=anim.getValue( op.patch.freeTimer.get() );
    
    if(v==value.get())
    {
        clearInterval(smoothInterval);
        op.log('kinetic finished...');
    }
    
    if(v!=v)v=0;
    result.set( v );
}

value.onChange=function()
{
    clearInterval(smoothInterval);
    smoothInterval=setInterval(updateSmooth, 15);

    if(firstTime)
    {
        anim.clear();
        anim.setValue(op.patch.freeTimer.get(), value.get() );
        firstTime=false;
        return;
    }

    anim.clear();
    anim.setValue(op.patch.freeTimer.get(), ( result.get()*0.7+value.get()*0.3 ) );
    
    var dist=Math.abs(result.get()-value.get());
    var duration=dist*1/smoothSpeed.get()+0.0001;
    anim.setValue(op.patch.freeTimer.get()+duration,value.get());
};