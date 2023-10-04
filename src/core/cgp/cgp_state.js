import { CG } from "../cg/cg_constants";
import { CGState } from "../cg/cg_state";
import Shader from "./cgp_shader";
import defaultShaderSrcVert from "./cgl_shader_default.wgsl";

/**
 * cables webgpu context/state manager
 * @external CGP
 * @namespace Context
 * @class
 * @hideconstructor
 */
const Context = function (_patch)
{
    CGState.apply(this);

    this.patch = _patch;

    this.gApi = CG.GAPI_WEBGPU;
    this._viewport = [0, 0, 256, 256];
    this._shaderStack = [];
    this._simpleShader = null;


    this.DEPTH_FUNCS = [
        "never",
        "always",
        "less",
        "less-equal",
        "greater",
        "greater-equal",
        "equal",
        "not-equal"
    ];

    this.CULL_MODES = [
        "none",
        "back",
        "front",
        "none" // both does not exist in webgpu
    ];





    // this._simpleShader = new Shader(this, "simpleshader");

    // this._simpleShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
    // this._simpleShader.setSource(Shader.getDefaultVertexShader(), Shader.getDefaultFragmentShader());


    /// ////////////////////

    this.getViewPort = () =>
    {
        return [0, 0, this.canvasWidth, this.canvasHeight];
    };

    this.renderStart = function (cgp, identTranslate, identTranslateView)
    {
        if (!this._simpleShader)
        {
            this._simpleShader = new Shader(this, "simple default shader");
            this._simpleShader.setSource(defaultShaderSrcVert);
            this._simpleShader.addUniformFrag("4f", "color", 1, 1, 0, 1);
        }

        this.fpsCounter.startFrame();

        this._startMatrixStacks(identTranslate, identTranslateView);
        this.setViewPort(0, 0, this.canvasWidth, this.canvasHeight);

        this.pushShader(this._simpleShader);
        this.pushDepthTest(true);
        this.pushDepthWrite(true);
        this.pushDepthFunc("less-equal");

        this.emitEvent("beginFrame");
    };

    this.renderEnd = () =>
    {
        this._endMatrixStacks();

        this.popShader();
        this.popDepthFunc();
        this.popDepthWrite();
        this.popDepthTest();

        this.emitEvent("endFrame");
        this.fpsCounter.endFrame();
    };


    this.setViewPort = function (x, y, w, h)
    {
        this._viewport = [x, y, w, h];
    };

    /**
     * @function getViewPort
     * @memberof Context
     * @instance
     * @description get current gl viewport
     * @returns {Array} array [x,y,w,h]
     */
    this.getViewPort = () =>
    {
        return this._viewPort;
    };


    this.createMesh = function (geom, glPrimitive)
    {
        return new CGP.Mesh(this, geom, glPrimitive);
    };

    this.getShader = () =>
    {
        return {};
    };

    /**
     * push a shader to the shader stack
     * @function pushShader
     * @memberof Context
     * @instance
     * @param {Object} shader
     * @function
    */
    this.pushShader = function (shader)
    {
        this._shaderStack.push(shader);
        // currentShader = shader;
    };

    /**
     * pop current used shader from shader stack
     * @function popShader
     * @memberof Context
     * @instance
     * @function
     */
    this.popShader = () =>
    {
        if (this._shaderStack.length === 0) throw new Error("Invalid shader stack pop!");
        this._shaderStack.pop();
        // currentShader = this._shaderStack[this._shaderStack.length - 1];
    };

    this.getShader = () =>
    {
        return this._shaderStack[this._shaderStack.length - 1];
        // if (currentShader) if (!this.frameStore || ((this.frameStore.renderOffscreen === true) == currentShader.offScreenPass) === true) return currentShader;
        // for (let i = this._shaderStack.length - 1; i >= 0; i--) if (this._shaderStack[i]) if (this.frameStore.renderOffscreen == this._shaderStack[i].offScreenPass) return this._shaderStack[i];
    };

    this.pushErrorScope = () =>
    {
        this.device.pushErrorScope("validation");
    };

    this.popErrorScope = function (name, cb)
    {
        this.device.popErrorScope().then((error) =>
        {
            if (error)
            {
                this.patch.emitEvent("criticalError", { "title": "WebGPU error \"" + name + "\"", "codeText": error.message });
                // if (this.patch.isEditorMode())console.log("WebGPU error " + this._name, error.message);

                console.warn("[cgp]", name, error.message, error, cb);
                if (cb)cb(error);
            }
        });
    };

    /**
     * push depth testing enabled state
     * @function pushDepthTest
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    this._stackDepthTest = [];
    this.pushDepthTest = function (b)
    {
        this._stackDepthTest.push(b);
    };
    /**
     * current state of depth testing
     * @function stateDepthTest
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    this.stateDepthTest = () =>
    {
        return this._stackDepthTest[this._stackDepthTest.length - 1];
    };

    /**
     * pop depth testing state
     * @function popDepthTest
     * @memberof Context
     * @instance
     */
    this.popDepthTest = () =>
    {
        this._stackDepthTest.pop();
    };

    // --------------------------------------
    // state depthwrite

    /**
     * push depth write enabled state
     * @function pushDepthTest
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    this._stackDepthWrite = [];
    this.pushDepthWrite = function (b)
    {
        b = b || false;
        this._stackDepthWrite.push(b);
    };

    /**
     * current state of depth writing
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    this.stateDepthWrite = () =>
    {
        return this._stackDepthWrite[this._stackDepthWrite.length - 1];
    };

    /**
     * pop depth writing state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    this.popDepthWrite = () =>
    {
        this._stackDepthWrite.pop();
    };








    // --------------------------------------
    // state depthfunc

    this._stackDepthFunc = [];

    /**
     * @function pushDepthFunc
     * @memberof Context
     * @instance
     * @param {string} depth compare func
     */
    this.pushDepthFunc = function (f)
    {
        this._stackDepthFunc.push(f);
    };

    /**
     * @function stateDepthFunc
     * @memberof Context
     * @instance
     * @returns {string}
     */
    this.stateDepthFunc = () =>
    {
        if (this._stackDepthFunc.length > 0) return this._stackDepthFunc[this._stackDepthFunc.length - 1];
        return false;
    };

    /**
     * pop depth compare func
     * @function popDepthFunc
     * @memberof Context
     * @instance
     */
    this.popDepthFunc = () =>
    {
        this._stackDepthFunc.pop();
    };














    // --------------------------------------
    // state CullFace

    /**
     * push face culling face enabled state
     * @function pushCullFaceFacing
     * @param {Boolean} enabled
     * @memberof Context
     * @instance
     */
    this._stackCullFace = [];
    this.pushCullFace = function (b)
    {
        this._stackCullFace.push(b);
    };

    /**
 * current state of face culling
 * @function stateCullFace
 * @returns {Boolean} enabled
 * @memberof Context
 * @instance
 */
    this.stateCullFace = () =>
    {
        return this._stackCullFace[this._stackCullFace.length - 1];
    };

    /**
 * pop face culling enabled state
 * @function popCullFace
 * @memberof Context
 * @instance
 */
    this.popCullFace = () =>
    {
        this._stackCullFace.pop();
    };


    // --------------------------------------
    // state CullFace Facing


    /**
     * push face culling face side
     * @function pushCullFaceFacing
     * @memberof Context
     * @instance
     */
    this._stackCullFaceFacing = [];
    this.pushCullFaceFacing = function (b)
    {
        this._stackCullFaceFacing.push(b);
    };

    /**
     * current state of face culling side
     * @function stateCullFaceFacing
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    this.stateCullFaceFacing = () =>
    {
        return this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1];
    };

    /**
     * pop face culling face side
     * @function popCullFaceFacing
     * @memberof Context
     * @instance
     */
    this.popCullFaceFacing = () =>
    {
        this._stackCullFaceFacing.pop();
    };
};
export { Context };
