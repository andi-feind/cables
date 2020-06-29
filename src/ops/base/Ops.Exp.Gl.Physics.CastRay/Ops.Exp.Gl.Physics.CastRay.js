const
    exec = op.inTrigger("Exec"),

    inX = op.inValueFloat("Screen X"),
    inY = op.inValueFloat("Screen Y"),
    inZ = op.inValueFloat("Screen Z"),


    next = op.outTrigger("Next"),

    hasHit = op.outValue("Has Hit"),
    hitX = op.outValue("Hit X"),
    hitY = op.outValue("Hit Y"),
    hitZ = op.outValue("Hit Z"),
    hitNormalX = op.outValue("Hit Normal X"),
    hitNormalY = op.outValue("Hit Normal Y"),
    hitNormalZ = op.outValue("Hit Normal Z"),
    hitResult = op.outObject("Result"),

    aabbX = op.outValue("aabb x"),
    aabbY = op.outValue("aabb y"),
    aabbZ = op.outValue("aabb z"),

    aabbX2 = op.outValue("aabb x2"),
    aabbY2 = op.outValue("aabb y2"),
    aabbZ2 = op.outValue("aabb z2"),

    toX = op.outValue("to x"),
    toY = op.outValue("to y"),
    toZ = op.outValue("to z"),

    fromX = op.outValue("from x"),
    fromY = op.outValue("from y"),
    fromZ = op.outValue("from z"),

    cgl = op.patch.cgl;
exec.onTriggered = render;

let rayResult = null;
const mat = mat4.create();

// let ray = new CANNON.Ray(
//     new CANNON.Vec3(0, 0, 0),
//     new CANNON.Vec3(0, 0, 0)
// );

function setRay(world)
{
    mat4.identity(mat);
    // var x = 2.0 * (inX.get() / cgl.canvas.clientWidth) -1;
    // var y = - 2.0 * (inY.get() / cgl.canvas.clientHeight) +1;
    const x = inX.get();
    const y = inY.get();

    const origin = vec3.fromValues(x, y, 0);
    mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
    mat4.invert(mat, mat);

    vec3.transformMat4(origin, origin, mat);

    // -----------

    const to = vec3.fromValues(x, y, 1);
    mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
    mat4.invert(mat, mat);

    vec3.transformMat4(to, to, mat);

    let vx = origin[0] - to[0];
    let vy = origin[1] - to[1];
    let vz = origin[2] - to[2];

    const v3 = vec3.create();
    vec3.set(v3, vx, vy, vz);
    vec3.normalize(v3, v3);
    vx = v3[0];
    vy = v3[1];
    vz = v3[2];
    // console.log(vx,vy,vz);

    const huge = 99999;

    origin[0] = to[0] + vx * huge;
    origin[1] = to[1] + vy * huge;
    origin[2] = to[2] + vz * huge;

    to[0] -= vx * huge;
    to[1] -= vy * huge;
    to[2] -= vz * huge;

    // ray = new CANNON.Ray(
    //     new CANNON.Vec3(to[0], to[1], to[2]),
    //     new CANNON.Vec3(origin[0], origin[1], origin[2])
    // );

    fromX.set(origin[0]);
    fromY.set(origin[1]);
    fromZ.set(origin[2]);

    toX.set(to[0]);
    toY.set(to[1]);
    toZ.set(to[2]);


    rayResult = new CANNON.RaycastResult();
    world.raycastClosest(
        new CANNON.Vec3(origin[0], origin[1], origin[2]),
        new CANNON.Vec3(to[0], to[1], to[2]),
        {},
        rayResult);
}

function render()
{
    const world = cgl.frameStore.world;
    if (!world) return;

    let hitBody = null;

    setRay(world);

    // const r = ray.intersectWorld(world, {});


    if (rayResult)
    {
        // console.log(rayResult);
        // console.log(rayResult);
        hasHit.set(rayResult.hasHit);
        // ray.skipBackFaces = true;
        if (rayResult.body)
        {
            aabbX.set(rayResult.body.aabb.lowerBound.x);
            aabbX.set(rayResult.body.aabb.lowerBound.y);
            aabbX.set(rayResult.body.aabb.lowerBound.z);

            aabbX2.set(rayResult.body.aabb.upperBound.x);
            aabbX2.set(rayResult.body.aabb.upperBound.y);
            aabbX2.set(rayResult.body.aabb.upperBound.z);

            // rayResult.body.dispatchEvent({type:"raycasthit"});
            hitBody = rayResult.body;
            hitBody.raycastHit = true;
        }

        // console.log(rayResult);

        hitX.set(rayResult.hitPointWorld.x);
        hitY.set(rayResult.hitPointWorld.y);
        hitZ.set(rayResult.hitPointWorld.z);

        hitNormalX.set(rayResult.hitNormalWorld.x);
        hitNormalY.set(rayResult.hitNormalWorld.y);
        hitNormalZ.set(rayResult.hitNormalWorld.z);
    }
    else hasHit.set(false);
    hitResult.set(rayResult);
    // console.log(rayResult);


    for (let i = 0; i < world.bodies.length; i++)
        if (world.bodies[i] != hitBody)world.bodies[i].raycastHit = false;


    next.trigger();
}
