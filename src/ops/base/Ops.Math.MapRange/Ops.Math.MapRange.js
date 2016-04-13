op.name='map value range';
var result=op.addOutPort(new Port(op,"result"));
var v=op.addInPort(new Port(op,"value"));
var old_min=op.addInPort(new Port(op,"old min"));
var old_max=op.addInPort(new Port(op,"old max"));
var new_min=op.addInPort(new Port(op,"new min"));
var new_max=op.addInPort(new Port(op,"new max"));


function exec()
{
    if(v.val>old_max.get())
    {
        result.set(new_max.get());
        return;
    }
    else
    if(v.get()<old_min.get())
    {
        result.set(new_min.get());
        return;
    }


    var nMin=parseFloat(new_min.val);
    var nMax=parseFloat(new_max.val);
    var oMin=parseFloat(old_min.val);
    var oMax=parseFloat(old_max.val);
    var x=parseFloat(v.val);

    var reverseInput = false;
    var oldMin = Math.min( oMin, oMax );
    var oldMax = Math.max( oMin, oMax );
    if(oldMin!= oMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min( nMin, nMax );
    var newMax = Math.max( nMin, nMax );
    if(newMin != nMin) reverseOutput = true;

    var portion=0;

    if(reverseInput) portion = (oldMax-x)*(newMax-newMin)/(oldMax-oldMin);
        else portion = (x-oldMin)*(newMax-newMin)/(oldMax-oldMin);
    
    if(reverseOutput) result.set(newMax - portion);
        else result.set(portion + newMin);

}

v.val=0;
old_min.val=-1;
old_max.val=1;
new_min.val=0;
new_max.val=1;


v.onValueChanged=exec;
old_min.onValueChanged=exec;
old_max.onValueChanged=exec;
new_min.onValueChanged=exec;
new_max.onValueChanged=exec;

exec();