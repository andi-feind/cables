const
    trigger = op.inTrigger("Trigger"),
    inCoords = op.inSwitch("Coordinate Format", ["-1 to 1"], "-1 to 1"),
    inX = op.inValueFloat("X"),
    inY = op.inValueFloat("Y"),
    active = op.inBool("Active", true),
    inCursor = op.inBool("Change Cursor", true),
    next = op.outTrigger("Next"),
    outHasHit = op.outBoolNum("Has Hit", false),
    outName = op.outString("Hit Body Name", ""),
    outX = op.outNumber("Hit X"),
    outY = op.outNumber("Hit Y"),
    outZ = op.outNumber("Hit Z");

const cgl = op.patch.cgl;
const oc = vec3.create();
const mat = mat4.create();
const dir = vec3.create();
let didsetCursor = false;
let isScreenCoords = true;

trigger.onTriggered = doRender;

function doRender()
{
    next.trigger();

    if (cgl.frameStore.collisionWorld)
    {
        const x = inX.get();
        const y = inY.get();

        const origin = vec3.fromValues(x, y, -1);
        mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
        mat4.invert(mat, mat);

        vec3.transformMat4(origin, origin, mat);

        // -----------

        const to = vec3.fromValues(x, y, 1);
        mat4.mul(mat, cgl.pMatrix, cgl.vMatrix);
        mat4.invert(mat, mat);

        vec3.transformMat4(to, to, mat);

        vec3.sub(dir, to, origin);
        vec3.normalize(dir, dir);
        const a = vec3.dot(dir, dir);

        let found = false;
        const bodies = cgl.frameStore.collisionWorld.bodies;
        for (let i = 0; i < bodies.length; i++)
        {
            const body = bodies[i];
            if (body.type == 1) // sphere
            {
                vec3.sub(oc, origin, body.pos);
                const b = 2 * vec3.dot(oc, dir);
                const c = vec3.dot(oc, oc) - (body.radius * body.radius);
                const discriminant = b * b - 4 * a * c;

                if (discriminant > 0)
                {
                    found = true;
                    outName.set(body.name);
                    outHasHit.set(true);

                    const dist = (-b - Math.sqrt(discriminant)) / (2 + a);

                    vec3.mul(oc, dir, [dist, dist, dist]);
                    vec3.add(oc, oc, origin);

                    outX.set(oc[0]);
                    outY.set(oc[1]);
                    outZ.set(oc[2]);
                }
            }
            else if (body.type == 2) // aabb
            {
                const t1 = (body.minX - origin[0]) / dir[0];
                const t2 = (body.maxX - origin[0]) / dir[0];

                const t3 = (body.minY - origin[1]) / dir[1];
                const t4 = (body.maxY - origin[1]) / dir[1];

                const t5 = (body.minZ - origin[2]) / dir[2];
                const t6 = (body.maxZ - origin[2]) / dir[2];

                const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
                const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

                // // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
                if (tmax < 0) continue;

                // if tmin > tmax, ray doesn't intersect AABB
                if (tmin > tmax) continue;

                found = true;
                outName.set(body.name);
                outHasHit.set(true);

                vec3.mul(oc, dir, [tmin, tmin, tmin]);
                vec3.add(oc, oc, origin);

                outX.set(oc[0]);
                outY.set(oc[1]);
                outZ.set(oc[2]);
            }
        }

        if (!found)
        {
            outName.set("");
            outHasHit.set(false);
            outX.set(0);
            outY.set(0);
            outZ.set(0);
        }
    }
}
