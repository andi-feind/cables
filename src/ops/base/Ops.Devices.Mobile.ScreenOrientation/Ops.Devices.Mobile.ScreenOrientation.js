op.name="ScreenOrientation";

var angle=op.outValue("Angle");
var str=op.outValue("Description");

var count=0;
window.addEventListener("resize", onOrientationChange, false);
window.addEventListener("orientationchange", onOrientationChange,false);

onOrientationChange();

screen.orientation.addEventListener('change', onOrientationChange);



function onOrientationChange()
{
    count++;
    angle.set(screen.orientation.angle);
    var s=screen.orientation.type+" #"+count+" WINORIENT:"+window.orientation;
    str.set(s);
}

op.onDelete=function()
{
    window.removeEventListener("resize", onOrientationChange);
    window.removeEventListener("orientationchange", onOrientationChange);
};



