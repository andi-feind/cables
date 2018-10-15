"use strict";
const inRenderAlways = op.inValueBool("render continiously");
const inExe = op.inTrigger ('Trigger');
const inStrAxiom = op.inValueString("Axiom / seed");
const inStrConstant1 = op.inValueString("Constant 1");
const inStrRule1 = op.inValueString("Rule 1");
const inStrConstant2 = op.inValueString("Constant 2");
const inStrRule2 = op.inValueString("Rule 2");
const inStrConstant3 = op.inValueString("Constant 3");
const inStrRule3 = op.inValueString("Rule 3");
const inStrConstant4 = op.inValueString("Constant 4");
const inStrRule4 = op.inValueString("Rule 4");

inRenderAlways.hidePort();
inStrAxiom.hidePort();
inStrConstant1.hidePort();
inStrRule1.hidePort();
inStrConstant2.hidePort();
inStrRule2.hidePort();
inStrConstant3.hidePort();
inStrRule3.hidePort();
inStrConstant4.hidePort();
inStrRule4.hidePort();

const inIterations = op.inValueInt("Iterations",1);
const inStepLength = op.inValue("Step length",0.5);
const inStepScale = op.inValue("Step scale multiplier",0.995);
const inDefaultAngle = op.inValue("Default angle");
const inRotateMutliplier = op.inValue("Rotation multiplier");

var needsCalc = true;

const outTrigger = op.outTrigger("out trigger");
const lineTrigger = op.outTrigger("line trigger");
const stringOut = op.outValueString('String out');
const outArray = op.outArray("Matrix Array out");
const outPoints = op.outArray("Points out");
const outIterationNumber = op.outValue("iteration number");
const outBranchNumber = op.outValue("iteration number");


const seed = op.inValue("random seed");
const inRandStr = op.inValue("random strength");

var angleMultiplier = inRotateMutliplier.get();
var len = inStepLength.get();
var lenScale = inStepScale.get();

var cgl = op.patch.cgl;

//create a matrix
var trans = mat4.create();
//array to put trans into
var transforms = [];
//pop in and out matrix for branch transforms
var stack = [];

//used for splines array
var pointArrays = [];
var currentPointArray=[];
var lastPointArray=[0,0,0];




//this becomes the axiom after the resetAll() is called 
var sentence = "";//axiom;

//an array that holds the string replacment rules
var rules = []


//UI input 
inRotateMutliplier.onChange = generate;
inStepLength.onChange = generate;
inStepScale.onChange = generate;
inIterations.onChange = generate;
inExe.onTriggered = render;
seed.onChange = generate;
inRandStr.onChange = generate;
inDefaultAngle.onChange = generate;

inStrAxiom.onChange = defineRules;
inStrConstant1.onChange = defineRules;
inStrRule1.onChange = defineRules;
inStrConstant2.onChange = defineRules;
inStrRule2.onChange = defineRules;

//creates the constants and the rule sets
function defineRules()
{
    rules[0]=
    {
        a : inStrConstant1.get(),
        b : inStrRule1.get(),
        c : inStrConstant2.get(),
        d : inStrRule2.get(),
        e : inStrConstant3.get(),
        f : inStrRule3.get(),
        g : inStrConstant4.get(),
        h : inStrRule4.get()
    }
    generate();
}
//reset everything
function resetAll()
{
    //define axiom here
    sentence = inStrAxiom.get();
    angleMultiplier = inRotateMutliplier.get();
    len = inStepLength.get();
    lenScale = inStepScale.get();
}

//generates the string from the ruleset
function generate()
{
   
    //reset the state of everything   
    resetAll();
    var nextSentence = "";
    var iterationsLimit = Math.min(4,inIterations.get());
    for (var iter = 0; iter < iterationsLimit ; iter++)
    {
        outIterationNumber.set(iter+1);
        for (var i =0; i < sentence.length; i++)
        {
            var current = sentence.charAt(i);
            var found = false;
            
            for (var j = 0; j < rules.length; j++)
            {
                if (current == rules[j].a)
                {
                    found = true;
                    nextSentence += rules[j].b;
                    break;
                }
                else if (current == rules[j].c)
                {
                    found = true;
                    nextSentence += rules[j].d;
                    break;
                }
                else if (current == rules[j].e)
                {
                    found = true;
                    nextSentence += rules[j].f;
                    break;
                }
                else if (current == rules[j].g)
                {
                    found = true;
                    nextSentence += rules[j].h;
                    break;
                }
                else if (current == rules[j].i)
                {
                    found = true;
                    nextSentence += rules[j].j;
                    break;
                }
                else if (current == rules[j].k)
                {
                    found = true;
                    nextSentence += rules[j].l;
                    break;
                }
                
            }    
            //if nothing is found continue no matter what
            if(!found)  nextSentence += current;
        }
        //final result
        sentence = nextSentence ;
        //used to debug the sentence as a string
        //can be removed later
        stringOut.set(sentence);
       
        //removing will add everything on top of each other recursively
        nextSentence="";
    }
    //draw everything with the turtle function
    turtle();
}


var pos=vec3.create();
var empty=vec3.create();  


function percentage(num, per)
{
  return (num/100)*per;
}

//extracts the user defined angle
//FfFx45yFF30 returns 45 on the x axis
function extract(str,pos)
{
    var slicedSent = str.slice(pos);

    var current = "";
    var output =  "";
    for (var i = 1; i < str.length;i++)
    {
        var number = "";
        //current = slicedSent.charAt(i);
        output = slicedSent.slice(i);

        
        for (var j = 0; j < output.length; j++)
        {

            var lookup = output.charAt(j);

            if (Number.isNaN(lookup) === false  )
            {
                number += lookup;   
            }
            else if (Number.isNaN(lookup) === true)
            {
                break;
            }
            
            
        }
        return parseFloat(number);
    }
}

//recreates the turtle algorithm
function turtle()
{
    //create the main transform array
    trans = mat4.create();
    transforms.length = 0;
    pointArrays.length=0;
    stack.length = 0;
    currentPointArray=[];
    var angleUi = "";

    var currentBranch = 0;
    for(var i = 0; i < sentence.length; i++)
    {
        //console.log("extract in turtle is " + extract(sentence,i));
        var current = sentence.charAt(i);
        //step forward, create point
        if(current == "F")
        {
            //apply to the trans matrix, take a step
            mat4.translate(trans,trans,[0.0,len,0.0]);
            //push matrix for geometry
            transforms.push(mat4.clone(trans));
            //get xyz for point array
            vec3.transformMat4(pos, empty, trans);
            //spline
            currentPointArray.push(pos[0],pos[1],pos[2]);

        }
        //step forward do not add a point
        else if (current == "f")
        {
            mat4.translate(trans,trans,[0.0,len,0.0]);
            
        }
        //alter step length by step multiplier
        else if (current == ">")
        {
            len *=lenScale;
        }
        else if (current == "<")
        {
            len /=lenScale;
        }
        //turn counter counter clockwise x defined by angle
        else if (current == "x")
        {
            
            //console.log("in x extract is " + extract(sentence,i))
            angleUi = -extract(sentence,i) * angleMultiplier ;
            mat4.rotateX(trans,trans,CGL.DEG2RAD * (angleUi -Math.seededRandom()* inRandStr.get()));
        }
        //turn counter clockwise x defined by angleUi
        else if (current == "X")
        {
            angleUi = extract(sentence,i) * angleMultiplier;
            mat4.rotateX(trans,trans,CGL.DEG2RAD * (angleUi + Math.seededRandom()* inRandStr.get()));
        }
        //turn counter counter clockwise y defined by angleUi
        else if (current == "y")
        {
            angleUi = -extract(sentence,i) ;
            mat4.rotateY(trans,trans,CGL.DEG2RAD * (angleUi -Math.seededRandom()* inRandStr.get()));
        }
        //turn counter clockwise y defined by angleUi
        else if (current == "Y")
        {
            angleUi = extract(sentence,i) ;
            mat4.rotateY(trans,trans,CGL.DEG2RAD * (angleUi + Math.seededRandom()* inRandStr.get()));
        }
        //turn counter counter clockwise z defined by angleUi
        else if (current == "z")
        {
            angleUi = -extract(sentence,i) ;
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * (angleUi -Math.seededRandom()* inRandStr.get()));
        }
        //turn counter  clockwise z defined by angleUi
        else if (current == "Z")
        {
            angleUi = extract(sentence,i) ;
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * (angleUi + Math.seededRandom()* inRandStr.get()));
        }
        ////turn 180 degrees
        else if (current == "|")
        {
            mat4.rotateZ(trans,trans,CGL.DEG2RAD * 180.0);
        }
        else if (current == "[")
        {
            //get current transform matrix push into stack, branch start
            stack.push(mat4.clone(trans));
            currentBranch +=1;
        }
        //
        else if (current == "]")
        {
            //stack.pop();//with tree this pop destroys the branching
            //get the current branch push into the transform matrix

            // //check if branch has a start to avoid error
            if(stack.length === 0) 
            {
                break;
            }
            outBranchNumber.set(currentBranch);
            trans = stack[stack.length-1];
            stack.pop();
            // lastPointArray=currentPointArray;
            pointArrays.push(currentPointArray);
            //comment out to see branch start end
            currentPointArray=[];
            
            
            // currentPointArray.push(
            //     lastPointArray[lastPointArray.length-3],
            //     lastPointArray[lastPointArray.length-2],
            //     lastPointArray[lastPointArray.length-1]);
            
        }
       
    }

    pointArrays.push(currentPointArray);
    outArray.set(transforms);
    
    //console.log("outPoints array length is " + pointArrays.length )
    //outPointsArrayLength.set(currentPointArray.length);
}

function render ()
{
    
    //iterate through transforms array trigger all geometry
    for(var i = 0; i < transforms.length; i++)
    {
        cgl.pushModelMatrix();
        mat4.multiply(cgl.mMatrix,cgl.mMatrix,transforms[i]);
        outTrigger.trigger();
        cgl.popModelMatrix();
    }
    
    //console.log("pointsArray array length is " + pointArrays.length )
    //iterate through points array for spline xyz data
    for(var i = 0; i < pointArrays.length ; i++)
    {
        outPoints.set(pointArrays[i]);
        lineTrigger.trigger();
    }
    //outPoints.set(pointArrays);
    //console.log("outPoints array length is " +outPoints.length )
    
}
