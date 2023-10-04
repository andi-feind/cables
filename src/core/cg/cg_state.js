import { CGP } from "../cgp";
import { EventTarget } from "../eventtarget";
import { CG } from "./cg_constants";
import { MatrixStack } from "./cg_matrixstack";
import Preprocessor from "./preproc";

const CGState = function ()
{
    EventTarget.apply(this);

    this.canvas = null;

    this.fpsCounter = new CABLES.CG.FpsCounter();
    this._identView = vec3.create();
    this._ident = vec3.create();
    vec3.set(this._identView, 0, 0, -2);
    vec3.set(this._ident, 0, 0, 0);


    this.DEPTH_COMPARE_FUNC_NEVER = 0;
    this.DEPTH_COMPARE_FUNC_LESS = 1;
    this.DEPTH_COMPARE_FUNC_EQUAL = 2;
    this.DEPTH_COMPARE_FUNC_LESSEQUAL = 3;
    this.DEPTH_COMPARE_FUNC_GREATER = 4;
    this.DEPTH_COMPARE_FUNC_NOTEQUAL = 5;
    this.DEPTH_COMPARE_FUNC_GREATEREQUAL = 6;
    this.DEPTH_COMPARE_FUNC_ALWAYS = 7;

    /**
         * Current projection matrix
         * @memberof Context
         * @instance
         * @type {mat4}
         */
    this.pMatrix = mat4.create();

    /**
          * Current model matrix
          * @memberof Context
          * @instance
          * @type {mat4}
          */
    this.mMatrix = mat4.create();

    /**
          * Current view matrix
          * @memberof Context
          * @instance
          * @type {mat4}
          */
    this.vMatrix = mat4.create();
    this._textureslots = [];

    this._pMatrixStack = new MatrixStack();
    this._mMatrixStack = new MatrixStack();
    this._vMatrixStack = new MatrixStack();

    this.canvasWidth = -1;
    this.canvasHeight = -1;
    this.canvasScale = 1;

    this.canvas = null;
    this.pixelDensity = 1;
    mat4.identity(this.mMatrix);
    mat4.identity(this.vMatrix);

    this.getGApiName = () =>
    {
        return ["WebGL", "WebGPU"][this.gApi];
    };

    this.setCanvas = function (canv)
    {
        if (typeof canv === "string") this.canvas = document.getElementById(canv);
        else this.canvas = canv;

        if (this._setCanvas) this._setCanvas(canv);

        this.updateSize();
    };

    this.updateSize = function ()
    {
        this.canvas.width = this.canvasWidth = this.canvas.clientWidth * this.pixelDensity;
        this.canvas.height = this.canvasHeight = this.canvas.clientHeight * this.pixelDensity;
    };

    this.setSize = function (w, h, ignorestyle)
    {
        if (!ignorestyle)
        {
            this.canvas.style.width = w + "px";
            this.canvas.style.height = h + "px";
        }

        this.canvas.width = w * this.pixelDensity;
        this.canvas.height = h * this.pixelDensity;

        this.updateSize();
    };

    this._resizeToWindowSize = function ()
    {
        this.setSize(window.innerWidth, window.innerHeight);
        this.updateSize();
    };

    this._resizeToParentSize = function ()
    {
        const p = this.canvas.parentElement;
        if (!p)
        {
            this._log.error("cables: can not resize to container element");
            return;
        }
        this.setSize(p.clientWidth, p.clientHeight);

        this.updateSize();
    };

    this.setAutoResize = function (parent)
    {
        window.removeEventListener("resize", this._resizeToWindowSize.bind(this));
        window.removeEventListener("resize", this._resizeToParentSize.bind(this));

        if (parent == "window")
        {
            window.addEventListener("resize", this._resizeToWindowSize.bind(this));
            window.addEventListener("orientationchange", this._resizeToWindowSize.bind(this));
            this._resizeToWindowSize();
        }
        if (parent == "parent")
        {
            window.addEventListener("resize", this._resizeToParentSize.bind(this));
            this._resizeToParentSize();
        }
    };


    /**
 * push a matrix to the projection matrix stack
 * @function pushPMatrix
 * @memberof Context
 * @instance
 * @param {mat4} projectionmatrix
 */
    this.pushPMatrix = function ()
    {
        this.pMatrix = this._pMatrixStack.push(this.pMatrix);
    };

    /**
  * pop projection matrix stack
  * @function popPMatrix
  * @memberof Context
  * @instance
  * @returns {mat4} current projectionmatrix
  */
    this.popPMatrix = function ()
    {
        this.pMatrix = this._pMatrixStack.pop();
        return this.pMatrix;
    };

    this.getProjectionMatrixStateCount = function ()
    {
        return this._pMatrixStack.stateCounter;
    };

    /**
  * push a matrix to the model matrix stack
  * @function pushModelMatrix
  * @memberof Context
  * @instance
  * @param {mat4} modelmatrix
  * @example
  * // see source code of translate op:
  * cgl.pushModelMatrix();
  * mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
  * trigger.trigger();
  * cgl.popModelMatrix();
  */
    this.pushModelMatrix = function ()
    {
        this.mMatrix = this._mMatrixStack.push(this.mMatrix);
    };

    /**
  * pop model matrix stack
  * @function popModelMatrix
  * @memberof Context
  * @instance
  * @returns {mat4} current modelmatrix
  */
    this.popModelMatrix = function ()
    {
        // todo: DEPRECATE
        // if (this._mMatrixStack.length === 0) throw "Invalid modelview popMatrix!";
        this.mMatrix = this._mMatrixStack.pop();
        return this.mMatrix;
    };

    /**
  * get model matrix
  * @function modelMatrix
  * @memberof Context
  * @instance
  * @returns {mat4} current modelmatrix
  */
    this.modelMatrix = function ()
    {
        return this.mMatrix;
    };


    /**
 * push a matrix to the view matrix stack
 * @function pushviewMatrix
 * @memberof Context
 * @instance
 * @param {mat4} viewmatrix
 */
    this.pushViewMatrix = function ()
    {
        this.vMatrix = this._vMatrixStack.push(this.vMatrix);
    };

    /**
  * pop view matrix stack
  * @function popViewMatrix
  * @memberof Context
  * @instance
  * @returns {mat4} current viewmatrix
  * @function
  */
    this.popViewMatrix = function ()
    {
        this.vMatrix = this._vMatrixStack.pop();
    };

    this.getViewMatrixStateCount = function ()
    {
        return this._vMatrixStack.stateCounter;
    };

    this._startMatrixStacks = (identTranslate, identTranslateView) =>
    {
        identTranslate = identTranslate || this._ident;
        identTranslateView = identTranslateView || this._identView;

        mat4.perspective(this.pMatrix, 45, this.canvasWidth / this.canvasHeight, 0.1, 1000.0);

        mat4.identity(this.mMatrix);
        mat4.identity(this.vMatrix);
        mat4.translate(this.mMatrix, this.mMatrix, identTranslate);
        mat4.translate(this.vMatrix, this.vMatrix, identTranslateView);

        this.pushPMatrix();
        this.pushModelMatrix();
        this.pushViewMatrix();
    };

    this._endMatrixStacks = () =>
    {
        this.popViewMatrix();
        this.popModelMatrix();
        this.popPMatrix();
    };
};

export { CGState };
