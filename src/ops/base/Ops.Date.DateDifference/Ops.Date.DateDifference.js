var ts1=op.inValue("Timestamp 1");
var ts2=op.inValue("Timestamp 2");
var stopAtZero=op.inValueBool("Stop at 0");
var outYear=op.outValue("Year");
var outMonth=op.outValue("Month");
var outDay=op.outValue("Day");
var outHours=op.outValue("Hours");
var outMinutes=op.outValue("Minutes");
var outSeconds=op.outValue("Seconds");
var outMilliSeconds=op.outValue("Milliseconds");

var outDiff=op.outValue("Diff");

ts1.onChange=update;
ts2.onChange=update;

function update()
{
    var d = new Date(ts1.get()-ts2.get() );
    outDiff.set(d.getTime());
    if(stopAtZero.get())
    {
        if(d.getTime()<0)d=new Date(0);
    }

    outMilliSeconds.set( d.getMilliseconds() );
    outSeconds.set( d.getSeconds() );
    outMinutes.set( d.getMinutes() );
    outHours.set( d.getHours()-1 );
    outDay.set( d.getDate()-1 );
    outMonth.set( d.getMonth() );
    outYear.set( d.getFullYear()-1970 );
}