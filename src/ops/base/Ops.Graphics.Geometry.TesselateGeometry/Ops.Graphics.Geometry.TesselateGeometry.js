const
    inGeom = op.inObject("Geometry"),
    inTimes = op.inValueInt("Iterations", 1),
    outGeom = op.outObject("Result"),
    outVertices = op.outNumber("Num Vertices");

inGeom.onChange =
    inTimes.onChange = update;

function tesselateTC(tc, x1, y1, x2, y2, x3, y3)
{
    tc.push(x1);
    tc.push(y1);

    tc.push((x1 + x2) / 2);
    tc.push((y1 + y2) / 2);

    tc.push((x1 + x3) / 2);
    tc.push((y1 + y3) / 2);

    // --

    tc.push((x1 + x2) / 2);
    tc.push((y1 + y2) / 2);

    tc.push(x2);
    tc.push(y2);

    tc.push((x2 + x3) / 2);
    tc.push((y2 + y3) / 2);

    // --

    tc.push((x2 + x3) / 2);
    tc.push((y2 + y3) / 2);

    tc.push(x3);
    tc.push(y3);

    tc.push((x1 + x3) / 2);
    tc.push((y1 + y3) / 2);

    // --

    tc.push((x1 + x2) / 2);
    tc.push((y1 + y2) / 2);

    tc.push((x2 + x3) / 2);
    tc.push((y2 + y3) / 2);

    tc.push((x1 + x3) / 2);
    tc.push((y1 + y3) / 2);
}

function tesselate(vertices, x1, y1, z1, x2, y2, z2, x3, y3, z3)
{
    vertices.push(x1);
    vertices.push(y1);
    vertices.push(z1);

    vertices.push((x1 + x2) / 2);
    vertices.push((y1 + y2) / 2);
    vertices.push((z1 + z2) / 2);

    vertices.push((x1 + x3) / 2);
    vertices.push((y1 + y3) / 2);
    vertices.push((z1 + z3) / 2);

    // --

    vertices.push((x1 + x2) / 2);
    vertices.push((y1 + y2) / 2);
    vertices.push((z1 + z2) / 2);

    vertices.push(x2);
    vertices.push(y2);
    vertices.push(z2);

    vertices.push((x2 + x3) / 2);
    vertices.push((y2 + y3) / 2);
    vertices.push((z2 + z3) / 2);

    // --

    vertices.push((x2 + x3) / 2);
    vertices.push((y2 + y3) / 2);
    vertices.push((z2 + z3) / 2);

    vertices.push(x3);
    vertices.push(y3);
    vertices.push(z3);

    vertices.push((x1 + x3) / 2);
    vertices.push((y1 + y3) / 2);
    vertices.push((z1 + z3) / 2);

    // --

    vertices.push((x1 + x2) / 2);
    vertices.push((y1 + y2) / 2);
    vertices.push((z1 + z2) / 2);

    vertices.push((x2 + x3) / 2);
    vertices.push((y2 + y3) / 2);
    vertices.push((z2 + z3) / 2);

    vertices.push((x1 + x3) / 2);
    vertices.push((y1 + y3) / 2);
    vertices.push((z1 + z3) / 2);
}

function tesselateGeom(oldGeom)
{
    const geom = new CGL.Geometry(op.name);
    const vertices = [];
    const norms = [];
    const biTangents = [];
    const tangents = [];
    const tc = [];

    let i, j, k;

    if (oldGeom.verticesIndices.length > 0)
    {
        for (i = 0; i < oldGeom.verticesIndices.length; i += 3)
        {
            for (j = 0; j < 4; j++)
                for (k = 0; k < 3; k++)
                {
                    norms.push(
                        oldGeom.vertexNormals[oldGeom.verticesIndices[i + k] * 3 + 0],
                        oldGeom.vertexNormals[oldGeom.verticesIndices[i + k] * 3 + 1],
                        oldGeom.vertexNormals[oldGeom.verticesIndices[i + k] * 3 + 2]
                    );

                    if (oldGeom.tangents)
                        tangents.push(
                            oldGeom.tangents[oldGeom.verticesIndices[i + k] * 3 + 0],
                            oldGeom.tangents[oldGeom.verticesIndices[i + k] * 3 + 1],
                            oldGeom.tangents[oldGeom.verticesIndices[i + k] * 3 + 2]
                        );

                    if (oldGeom.biTangents)
                        biTangents.push(
                            oldGeom.biTangents[oldGeom.verticesIndices[i + k] * 3 + 0],
                            oldGeom.biTangents[oldGeom.verticesIndices[i + k] * 3 + 1],
                            oldGeom.biTangents[oldGeom.verticesIndices[i + k] * 3 + 2]
                        );
                }

            tesselate(vertices,
                oldGeom.vertices[oldGeom.verticesIndices[i + 0] * 3 + 0],
                oldGeom.vertices[oldGeom.verticesIndices[i + 0] * 3 + 1],
                oldGeom.vertices[oldGeom.verticesIndices[i + 0] * 3 + 2],

                oldGeom.vertices[oldGeom.verticesIndices[i + 1] * 3 + 0],
                oldGeom.vertices[oldGeom.verticesIndices[i + 1] * 3 + 1],
                oldGeom.vertices[oldGeom.verticesIndices[i + 1] * 3 + 2],

                oldGeom.vertices[oldGeom.verticesIndices[i + 2] * 3 + 0],
                oldGeom.vertices[oldGeom.verticesIndices[i + 2] * 3 + 1],
                oldGeom.vertices[oldGeom.verticesIndices[i + 2] * 3 + 2]
            );

            tesselateTC(tc,
                oldGeom.texCoords[oldGeom.verticesIndices[i + 0] * 2 + 0],
                oldGeom.texCoords[oldGeom.verticesIndices[i + 0] * 2 + 1],

                oldGeom.texCoords[oldGeom.verticesIndices[i + 1] * 2 + 0],
                oldGeom.texCoords[oldGeom.verticesIndices[i + 1] * 2 + 1],

                oldGeom.texCoords[oldGeom.verticesIndices[i + 2] * 2 + 0],
                oldGeom.texCoords[oldGeom.verticesIndices[i + 2] * 2 + 1]
            );
        }
    }
    else
    {
        if (oldGeom.vertices.length > 0)
        {
            for (i = 0; i < oldGeom.vertices.length; i += 9)
            {
                for (j = 0; j < 4; j++)
                {
                    for (k = 0; k < 9; k++)
                        norms.push(oldGeom.vertexNormals[i + k]);

                    if (oldGeom.tangents)
                        for (k = 0; k < 9; k++)
                            tangents.push(oldGeom.tangents[i + k]);

                    if (oldGeom.biTangents)
                        for (k = 0; k < 9; k++)
                            biTangents.push(oldGeom.biTangents[i + k]);
                }

                tesselate(vertices,
                    oldGeom.vertices[i + 0],
                    oldGeom.vertices[i + 1],
                    oldGeom.vertices[i + 2],

                    oldGeom.vertices[i + 3],
                    oldGeom.vertices[i + 4],
                    oldGeom.vertices[i + 5],

                    oldGeom.vertices[i + 6],
                    oldGeom.vertices[i + 7],
                    oldGeom.vertices[i + 8]
                );

                tesselateTC(tc,
                    oldGeom.texCoords[i / 9 * 6 + 0],
                    oldGeom.texCoords[i / 9 * 6 + 1],

                    oldGeom.texCoords[i / 9 * 6 + 2],
                    oldGeom.texCoords[i / 9 * 6 + 3],

                    oldGeom.texCoords[i / 9 * 6 + 4],
                    oldGeom.texCoords[i / 9 * 6 + 5]

                );
            }
        }
    }

    geom.vertexNormals = norms;
    geom.setVertices(vertices);
    geom.setTexCoords(tc);
    geom.tangents = tangents;
    geom.biTangents = biTangents;
    return geom;
}

function update()
{
    let geom = inGeom.get();
    if (!geom) return;
    const startTime = CABLES.now();

    for (let i = 0; i < inTimes.get(); i++)
    {
        geom = tesselateGeom(geom);
    }

    outVertices.set(geom.vertices.length / 3);

    outGeom.setRef(geom);
}
