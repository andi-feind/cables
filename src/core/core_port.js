import EventTarget from "./0_eventtarget";
import { generateUUID } from "./0_utils";
import { Anim } from "./anim";
import { CONSTANTS } from "./constants";
/**
 * data is coming into and out of ops through input and output ports
 * @external CABLES
 * @namespace Port
 * @class
 * @hideconstructor
 * @example
 * const myPort=op.inString("String Port");
 */

export const PORT_DIR_IN = 0;
export const PORT_DIR_OUT = 1;

// var CABLES=CABLES || {};

const Port = function (__parent, name, type, uiAttribs)
{
    EventTarget.apply(this);

    this.data = {}; // reserved for port-specific user-data
    /**
     * @type {Number}
     * @name direction
     * @instance
     * @memberof Port
     * @description direction of port (input(0) or output(1))
     */
    this.direction = CONSTANTS.PORT.PORT_DIR_IN;
    this.id = generateUUID();
    this.parent = __parent;

    /**
     * @type {Array<Link>}
     * @name links
     * @instance
     * @memberof Port
     * @description links of port
     */
    this.links = [];
    this.value = 0.0;
    this.name = name;
    this.type = type || CONSTANTS.OP.OP_PORT_TYPE_VALUE;
    this.uiAttribs = uiAttribs || {};
    this.anim = null;
    var oldAnimVal = -5711;
    this.defaultValue = null;

    this._uiActiveState = true;
    this.ignoreValueSerialize = false;
    // this.onLink=null;
    this.onLinkChanged = null;
    this.crashed = false;

    this._valueBeforeLink = null;
    this._lastAnimFrame = -1;
    this._animated = false;

    this.onValueChanged = null;
    this.onTriggered = null;
    this.onUiActiveStateChange = null;
    this.changeAlways = false;

    this._warnedDeprecated = false;

    // this.onUiAttrChange=null;

    Object.defineProperty(this, "val", {
        get()
        {
            this._warnedDeprecated = true;
            return this.get();
        },
        set(v)
        {
            this.setValue(v);
            // if(!this._warnedDeprecated)console.log('deprecated .val set used',this.parent.name);
            this._warnedDeprecated = true;
        },
    });
};

/**
 * change listener for input value ports, overwrite to react to changes
 * @function onChange
 * @memberof Port
 * @instance
 * @example
 * const myPort=op.inString("MyPort");
 * myPort.onChange=function()
 * {
 *   console.log("was changed to: ",myPort.get());
 * }
 *
 */

Port.prototype.onAnimToggle = function () {};
Port.prototype._onAnimToggle = function ()
{
    this.onAnimToggle();
};

/**
 * @function hidePort
 * @memberof Port
 * @instance
 * @description hide port rectangle in op
 */
Port.prototype.hidePort = function ()
{
    this.setUiAttribs({ hidePort: true });
};

/**
 * @function remove
 * @memberof Port
 * @instance
 * @description remove port
 */
Port.prototype.remove = function ()
{
    // this.setUiAttribs({hidePort:true});
    this.removeLinks();
    this.parent.removePort(this);
};

/**
 * set ui attributes
 * @function setUiAttribs
 * @memberof Port
 * @instance
 * @param {Object} newAttribs
 * <pre>
 * title - overwrite title of port (by default this is portname)
 * greyout - port paramater will appear greyed out, can not be
 * hidePort - port will be hidden from op
 * hideParam - port params will be hidden from parameter panel
 * showIndex - only for dropdowns - show value index (e.g. `0 - normal` )
 * editorSyntax - set syntax highlighting theme for editor port
 * </pre>
 * @example
 * myPort.setUiAttribs({greyout:true});
 */
Port.prototype.setUiAttribs = function (newAttribs)
{
    if (!this.uiAttribs) this.uiAttribs = {};
    for (var p in newAttribs)
    {
        this.uiAttribs[p] = newAttribs[p];
    }
    // if(this.onUiAttrChange) this.onUiAttrChange(newAttribs);
    this.emitEvent("onUiAttrChange", newAttribs);
    // console.log("new attribs!",newAttribs);
};

/**
 * @function get
 * @memberof Port
 * @instance
 * @description get value of port
 */
Port.prototype.get = function ()
{
    if (this._animated && this._lastAnimFrame != this.parent.patch.getFrameNum())
    {
        this._lastAnimFrame = this.parent.patch.getFrameNum();
        this.value = this.anim.getValue(this.parent.patch.timer.getTime());

        // if(oldAnimVal!=this.value)
        {
            oldAnimVal = this.value;
            this.forceChange();
        }
    }

    return this.value;
};

/**
 * @function setValue
 * @memberof Port
 * @instance
 * @description set value of port / will send value to all linked ports (only for output ports)
 */
Port.prototype.set = Port.prototype.setValue = function (v)
{
    if (v === undefined) return;

    if (this.parent.enabled && !this.crashed)
    {
        if (v !== this.value || this.changeAlways || this.type == CONSTANTS.OP.OP_PORT_TYPE_TEXTURE || this.type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY)
        {
            if (this._animated)
            {
                this.anim.setValue(this.parent.patch.timer.getTime(), v);
            }
            else
            {
                try
                {
                    this.value = v;
                    this.forceChange();
                }
                catch (ex)
                {
                    this.crashed = true;
                    this.setValue = function (v) {};
                    this.onTriggered = function () {};

                    console.log("exception!");
                    console.error("onvaluechanged exception cought", ex);
                    console.log(ex.stack);
                    console.log(`exception in: ${this.parent.name}`);
                    if (gui) gui.showOpCrash(this.parent);

                    if (CABLES.UI) CABLES.UI.MODAL.showException(ex, this.parent);
                }

                if (CABLES.UI && this.type == CONSTANTS.OP.OP_PORT_TYPE_TEXTURE)
                {
                    gui.texturePreview().updateTexturePort(this);
                }
            }

            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) for (var i = 0; i < this.links.length; ++i) this.links[i].setValue();
        }
    }
};

Port.prototype.updateAnim = function ()
{
    if (this._animated)
    {
        this.value = this.get();

        if (oldAnimVal != this.value || this.changeAlways)
        {
            oldAnimVal = this.value;
            this.forceChange();
        }
        oldAnimVal = this.value;
    }
};

Port.args = function (func)
{
    return `${func}`
        .replace(/[/][/].*$/gm, "") // strip single-line comments
        .replace(/\s+/g, "") // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments
        .split("){", 1)[0]
        .replace(/^[^(]*[(]/, "") // extract the parameters
        .replace(/=[^,]+/g, "") // strip any ES6 defaults
        .split(",")
        .filter(Boolean); // split & filter [""]
};

Port.prototype.forceChange = function ()
{
    if (this.onValueChanged || this.onChange)
    {
        // very temporary: deprecated warning!!!!!!!!!
        // var params=Port.args(this.onValueChanged||this.onChange)
        // if(params.length>0) console.warn('TOM: port has onchange params!',this.parent.objName,this.name);
    }

    if (this.onChange) this.onChange(this, this.value);
    else if (this.onValueChanged) this.onValueChanged(this, this.value); // deprecated
};

/**
 * @function getTypeString
 * @memberof Port
 * @instance
 * @description get port type as string, e.g. "Function","Value"...
 * @return {String} type
 */
Port.prototype.getTypeString = function ()
{
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) return "Number";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) return "Trigger";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) return "Object";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) return "Dynamic";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY) return "Array";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_STRING) return "String";
    return "Unknown";
};

Port.prototype.getSerialized = function ()
{
    var obj = {};
    obj.name = this.getName();

    if (!this.ignoreValueSerialize && this.links.length === 0)
    {
        if (this.type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT && this.value && this.value.tex)
        {
        }
        else obj.value = this.value;
    }
    if (this._animated) obj.animated = true;
    if (this.anim) obj.anim = this.anim.getSerialized();
    if (this.uiAttribs.display == "file") obj.display = this.uiAttribs.display;
    if (this.direction == CONSTANTS.PORT.PORT_DIR_IN && this.links.length > 0)
    {
        obj.links = [];
        for (var i in this.links)
        {
            if (this.links[i].portIn && this.links[i].portOut) obj.links.push(this.links[i].getSerialized());
        }
    }
    return obj;
};

Port.prototype.shouldLink = function ()
{
    return true;
};

/**
 * @function removeLinks
 * @memberof Port
 * @instance
 * @description remove all links from port
 */
Port.prototype.removeLinks = function ()
{
    var count = 0;
    while (this.links.length > 0)
    {
        count++;
        if (count > 5000)
        {
            console.warn("could not delete links... / infinite loop");
            this.links.length = 0;
            break;
        }
        this.links[0].remove();
    }
};

/**
 * @function removeLink
 * @memberof Port
 * @instance
 * @description remove all link from port
 * @param {CABLES.Link} link
 */
Port.prototype.removeLink = function (link)
{
    for (var i in this.links)
    {
        if (this.links[i] == link)
        {
            this.links.splice(i, 1);
        }
    }

    if (this.direction == CONSTANTS.PORT.PORT_DIR_IN)
    {
        if (this.type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) this.setValue(this._valueBeforeLink || 0);
        else this.setValue(this._valueBeforeLink || null);
    }

    // if (this.type == CABLES.CONSTANTS.OP.OP_PORT_TYPE_OBJECT && this.direction == CABLES.CONSTANTS.PORT.PORT_DIR_IN && this.links.length > 0)
    // {
    //     console.log("REMOVELINK OBJECT!!",this);

    //     for (var i=0;i<this.links.length;i++)
    //     {
    //         // console.log('iii', i, this.links[i].portOut.get());
    //         // this.links[i].setValue();
    //         // this.set(null);
    //         // this.forceChange();
    //         this.set(this.links[i].portOut.get());
    //         console.log(this.get())
    //         // this.forceChange();

    //     }
    // }

    if (this.onLinkChanged) this.onLinkChanged();
    this.emitEvent("onLinkChanged");
};

/**
 * @function getName
 * @memberof Port
 * @instance
 * @description return port name
 */
Port.prototype.getName = function ()
{
    return this.name;
};

Port.prototype.addLink = function (l)
{
    this._valueBeforeLink = this.value;
    this.links.push(l);
    if (this.onLinkChanged) this.onLinkChanged();
    this.emitEvent("onLinkChanged");
};

/**
 * @function getLinkTo
 * @memberof Port
 * @instance
 * @param {Port} otherPort
 * @description return link, which is linked to otherPort
 */
Port.prototype.getLinkTo = function (p2)
{
    for (var i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return this.links[i];
};

/**
 * @function removeLinkTo
 * @memberof Port
 * @instance
 * @param {Port} otherPort
 * @description removes link, which is linked to otherPort
 */
Port.prototype.removeLinkTo = function (p2)
{
    for (var i in this.links)
    {
        if (this.links[i].portIn == p2 || this.links[i].portOut == p2)
        {
            this.links[i].remove();
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent("onLinkChanged");
            return;
        }
    }
};

/**
 * @function isLinkedTo
 * @memberof Port
 * @instance
 * @param {Port} otherPort
 * @description returns true if port is linked to otherPort
 */
Port.prototype.isLinkedTo = function (p2)
{
    for (var i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return true;

    return false;
};

/**
 * @function trigger
 * @memberof Port
 * @instance
 * @description trigger the linked port (usually invoked on an output function port)
 */
Port.prototype.trigger = function ()
{
    if (this.links.length === 0) return;
    if (!this.parent.enabled) return;

    var portTriggered = null;
    try
    {
        for (var i = 0; i < this.links.length; ++i)
        {
            if (this.links[i].portIn)
            {
                portTriggered = this.links[i].portIn;
                portTriggered._onTriggered();
            }
            if (this.links[i]) this.links[i].activity();
        }
    }
    catch (ex)
    {
        this.parent.enabled = false;

        if (CABLES.UI)
        {
            CABLES.UI.MODAL.showException(ex, portTriggered.parent);

            if (window.gui) gui.showOpCrash(portTriggered.parent);
        }
        console.log("exception!");
        console.error("ontriggered exception cought", ex);
        console.log(ex.stack);
        console.log(`exception in: ${portTriggered.parent.name}`);
    }
};

Port.prototype.call = function ()
{
    console.log("call deprecated - use trigger() ");
    this.trigger();
};

Port.prototype.execute = function ()
{
    console.log(`### execute port: ${this.getName()}`, this.goals.length);
};

Port.prototype.setAnimated = function (a)
{
    if (this._animated != a)
    {
        this._animated = a;
        if (this._animated && !this.anim) this.anim = new Anim();
        this._onAnimToggle();
    }
};

Port.prototype.toggleAnim = function (val)
{
    this._animated = !this._animated;
    if (this._animated && !this.anim) this.anim = new Anim();
    this.setAnimated(this._animated);
    this._onAnimToggle();
};

/**
 * <pre>
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_VALUE = 0;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_FUNCTION = 1;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_OBJECT = 2;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_TEXTURE = 2;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_ARRAY = 3;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC = 4;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_STRING = 5;
 * </pre>
 * @function getType
 * @memberof Port
 * @instance
 * @return {Number} type of port
 */
Port.prototype.getType = function ()
{
    return this.type;
};

/**
 * @function isLinked
 * @memberof Port
 * @instance
 * @return {Boolean} true if port is linked
 */
Port.prototype.isLinked = function ()
{
    return this.links.length > 0;
};

/**
 * @function isAnimated
 * @memberof Port
 * @instance
 * @return {Boolean} true if port is animated
 */
Port.prototype.isAnimated = function ()
{
    return this._animated;
};

/**
 * @function isHidden
 * @memberof Port
 * @instance
 * @return {Boolean} true if port is hidden
 */
Port.prototype.isHidden = function ()
{
    return this.uiAttribs.hidePort;
};

/**
 * @function onTriggered
 * @memberof Port
 * @instance
 * @param {onTriggeredCallback} callback
 * @description set callback, which will be executed when port was triggered (usually output port)
 */
Port.prototype._onTriggered = function ()
{
    this.parent.updateAnims();
    if (this.parent.enabled && this.onTriggered) this.onTriggered();
};

Port.prototype._onTriggeredProfiling = function ()
{
    this.parent.updateAnims();
    this.parent.patch.profiler.add("port", this);

    if (this.parent.enabled && this.onTriggered) this.onTriggered();
    this.parent.patch.profiler.add("port", null);
};

Port.prototype.onValueChange = function (cb)
{
    // deprecated
    this.onChange = cb;
};

Port.prototype.getUiActiveState = function ()
{
    return this._uiActiveState;
};

Port.prototype.setUiActiveState = function (onoff)
{
    _uiActiveState = onoff;
    if (this.onUiActiveStateChange) this.onUiActiveStateChange();
};

/**
 * Returns the port type string, e.g. "value" based on the port type number
 * @function portTypeNumberToString
 * @instance
 * @memberof Port
 * @param {Number} type - The port type number
 * @returns {String} - The port type as string
 */
Port.portTypeNumberToString = function (type)
{
    if (type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) return "value";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) return "function";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) return "object";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY) return "array";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_STRING) return "string";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) return "dynamic";
    return "unknown";
};

// var Port = Port; // TODO deprecated.. remove one day...

export default Port;
export { Port };
