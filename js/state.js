const state = {

    isConvolution: true,
    isCausal: false,
    isAutoScale: true,
    isPeriodicMode: false,

    signalType: 'ruido',
    filterType: 'exp',

    freq: 1,
    width: 40,

    sliderT: 250,
    t: 0
};

const T = 60;

let stepMode = false;
let currentStep = 0;
let freezeIntegral = false;
let isPlaying = false;
let animationInterval = null;
let cacheDirty = true;
let responseCache = null;

const signalBuffer = new Float32Array(501);
const kernelBuffer = new Float32Array(501);