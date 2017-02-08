op.name="AutoWah";

CABLES.WebAudio.createAudioContext(op);

// defaults
var GAIN_DEFAULT = 2;
var GAIN_MIN = 0;
var GAIN_MAX = 2;  // TODO: check
var QUALITY_DEFAULT = 2;
var QUALITY_MIN = 1; // TODO: check
var QUALITY_MAX = 8; // TODO: check
var OCTAVES_DEFAULT = 6;
var BASE_FREQUENCY_DEFAULT = 100;
var SENSITIVITY_DEFAULT = 0;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// vars
var node = new Tone.AutoWah();



// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var gainPort = CABLES.WebAudio.createAudioParamInPort(op, "Gain", node.gain, {"display": "range", "min": GAIN_MIN, "max": GAIN_MAX}, GAIN_DEFAULT);
var qualityPort = CABLES.WebAudio.createAudioParamInPort(op, "Quality", node.q, {"display": "range", "min": QUALITY_MIN, "max": QUALITY_MIN}, QUALITY_DEFAULT);
var octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
var baseFrequencyPort = op.inValue("Base Frequency", BASE_FREQUENCY_DEFAULT);
var sensitivityPort = op.inValue("Sensitivity", SENSITIVITY_DEFAULT);
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
octavesPort.onChange = function() {
    node.set("octaves", octavesPort.get());    
};

baseFrequencyPort.onChange = function() {
    node.set("baseFrequency", baseFrequencyPort.get());    
};

sensitivityPort.onChange = function() {
    node.set("sensitivity", sensitivityPort.get());    
};

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

