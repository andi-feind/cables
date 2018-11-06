var exe=op.inTrigger("exe");
var duration=op.inValue("duration",0.5);
var min=op.inValue("min",0);
var max=op.inValue("max",1);
var pause=op.inValue("pause between",0);
var seed=op.inValue("random seed",0);

var result=op.outValue("result");
var looped=op.outTrigger("Looped");

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing",reinit);


var counter=0;

min.onChange=
max.onChange=
pause.onChange=
seed.onChange=
duration.onChange=reinitLater;

var needsReinit=true;

function reinitLater()
{
    needsReinit=true;
}

function getRandom()
{
    var minVal = ( min.get() );
    return Math.seededRandom() * (  max.get()  - minVal ) + minVal;
}

function reinit()
{
    Math.randomSeed=seed.get()+counter*100;
    init(getRandom());
    needsReinit=false;
}

function init(v)
{
    anim.clear();

    anim.setValue(op.patch.freeTimer.get(), v);
    if(pause.get()!==0.0) anim.setValue(op.patch.freeTimer.get()+pause.get(), v);

    anim.setValue(duration.get()+op.patch.freeTimer.get()+pause.get(), getRandom());
}


exe.onTriggered=function()
{
    if(needsReinit)reinit();

    var t=op.patch.freeTimer.get();
    var v=anim.getValue(t);

    if(anim.hasEnded(t))
    {
        counter++;
        anim.clear();
        init(v);
        looped.trigger();
    }
    result.set(v);
};

