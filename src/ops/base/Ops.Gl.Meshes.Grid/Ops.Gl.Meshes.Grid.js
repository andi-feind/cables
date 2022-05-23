const
    render = op.inTrigger("Render"),
    inNum = op.inValue("Num", 10),
    inSpacing = op.inValue("Spacing", 1),
    inCenter = op.inBool("Center", true),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let mesh = null;

inCenter.onChange =
    inNum.onChange =
    inSpacing.onChange = function ()
    {
        if (mesh)mesh.dispose();
        mesh = null;
    };

function init()
{
    const geomStepsOne = new CGL.Geometry(op.name);
    const geomX = new CGL.Geometry(op.name);

    const space = inSpacing.get();
    const num = Math.floor(inNum.get());
    const l = space * num / 2;

    const tc = [];

    let start = -num / 2;
    let end = num / 2 + 1;

    for (let i = start; i < end; i++)
    {
        geomStepsOne.vertices.push(-l);
        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(l);
        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(-l);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(l);
        geomStepsOne.vertices.push(0);

        tc.push(0, 0);
        tc.push(0, 0);
        tc.push(0, 0);
        tc.push(0, 0);
    }

    if (!inCenter.get())
    {
        for (let i = 0; i < geomStepsOne.vertices.length; i += 3)
        {
            geomStepsOne.vertices[i + 0] += l;
            geomStepsOne.vertices[i + 1] += l;
        }
    }

    geomStepsOne.setTexCoords(tc);
    geomStepsOne.calculateNormals();

    if (!mesh) mesh = new CGL.Mesh(cgl, geomStepsOne);
    else mesh.setGeom(geomStepsOne);
}

render.onTriggered = function ()
{
    if (!mesh)init();
    let shader = cgl.getShader();
    if (!shader) return;

    let oldPrim = shader.glPrimitive;

    shader.glPrimitive = cgl.gl.LINES;

    mesh.render(shader);

    shader.glPrimitive = oldPrim;

    next.trigger();
};
