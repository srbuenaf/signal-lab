/* =========================================================
   ESTADO
========================================================= */



/* =========================================================
   CACHE
========================================================= */



/* =========================================================
   RUIDO
========================================================= */


/* =========================================================
   BUFFERS
========================================================= */



/* =========================================================
   UI → STATE
========================================================= */

function syncStateFromUI(){

    const oldSignal = state.signalType;
    const oldFilter = state.filterType;
    const oldFreq = state.freq;
    const oldWidth = state.width;

    state.signalType =
        document.getElementById('sf').value;

    state.filterType =
        document.getElementById('sh').value;

    state.freq =
        parseFloat(
            document.getElementById('freq').value
        );

    state.width =
        parseFloat(
            document.getElementById('width').value
        );

    state.sliderT =
        parseInt(
            document.getElementById('st').value
        );

    state.t = state.sliderT - 250;

    if(
        oldSignal !== state.signalType ||
        oldFilter !== state.filterType ||
        oldFreq !== state.freq ||
        oldWidth !== state.width
    ){
        cacheDirty = true;
    }
}

/* =========================================================
   SEÑALES
========================================================= */

/* =========================================================
   FILTRO BASE
========================================================= */

/* =========================================================
   PERIODIZACIÓN
========================================================= */

/* =========================================================
   TRANSFORMACIÓN
========================================================= */

/* =========================================================
   BUFFERS
========================================================= */

/* =========================================================
   PATHS
========================================================= */

/* =========================================================
   CONVOLUCIÓN
========================================================= */

/* =========================================================
   RENDER
========================================================= */

/* =========================================================
   LABELS
========================================================= */

/* =========================================================
   BOTONES
========================================================= */

/* =========================================================
   STEP MODE
========================================================= */

/* =========================================================
   CONTROLES
========================================================= */

function updateControls(){

    const grpFreq =
        document.getElementById('grp-freq');

    const grpWidth =
        document.getElementById('grp-width');

    const grpCausal =
        document.getElementById('grp-causal');

    const lblWidth =
        document.getElementById('lbl-width');

    if(state.signalType !== 'cos'){

        grpFreq.classList.add('disabled');

        document.getElementById('freq')
            .disabled = true;

    }else{

        grpFreq.classList.remove('disabled');

        document.getElementById('freq')
            .disabled = false;
    }

    if(state.filterType === 'delta'){

        grpWidth.classList.add('disabled');

        document.getElementById('width')
            .disabled = true;

    }else{

        grpWidth.classList.remove('disabled');

        document.getElementById('width')
            .disabled = false;
    }

    if(
        state.filterType === 'delta' ||
        state.filterType === 'exp'
    ){

        grpCausal.classList.add('disabled');

        document.getElementById('b-causal')
            .disabled = true;

    }else{

        grpCausal.classList.remove('disabled');

        document.getElementById('b-causal')
            .disabled = false;
    }

    lblWidth.textContent =
        state.filterType === 'sinc'
            ? "Frecuencia de Corte"
            : "Ancho del Filtro";
}

/* =========================================================
   CACHE
========================================================= */

function rebuildResponseCache(){

    responseCache =
        computeResponseCurve();

    cacheDirty = false;
}

/* =========================================================
   UPDATE
========================================================= */

function update(forceMath=false){

    syncStateFromUI();

    document.getElementById('v-t')
        .textContent = state.t;

    document.getElementById('time-big')
        .textContent = `t = ${state.t}`;

    document.getElementById('shift-display')
        .textContent =
        `Desplazamiento: t = ${state.t}`;
        

    document.getElementById('v-freq')
        .textContent = state.freq;

    document.getElementById('v-width')
        .textContent = state.width;

    updateControls();
    renderButtons();
    renderLabels(forceMath);

    const paths =
        computeSignalPaths(state.t);

    renderMiniSignals(paths);

    if(
        cacheDirty ||
        responseCache === null
    ){
        rebuildResponseCache();
    }

    renderResponse(responseCache);

    renderGuides();

    renderStepMode();
}

/* =========================================================
   PLAY
========================================================= */

function animate() {

    if (freezeIntegral)
        return;

    let slider =
        document.getElementById('st');

    let current =
        parseInt(slider.value);

    current += 1;


    if (current > 500)
        current = 0;


    slider.value = current;

    update(false);
}

function togglePlay(){

    const b =
        document.getElementById('b-play');

    isPlaying = !isPlaying;

    if(isPlaying){

        b.textContent = "⏸ PAUSE";

        animationInterval =
            setInterval(animate,40);

    }else{

        b.textContent = "▶ PLAY";

        clearInterval(animationInterval);
    }
}

/* =========================================================
   TOGGLES
========================================================= */

function toggleMode(){

    state.isConvolution =
        !state.isConvolution;

    cacheDirty = true;

    update(true);
}

function toggleCausal(){

    state.isCausal =
        !state.isCausal;

    cacheDirty = true;

    update(true);
}

function togglePeriodic(){

    state.isPeriodicMode =
        !state.isPeriodicMode;

    cacheDirty = true;

    update(true);
}

function toggleScale(){

    state.isAutoScale =
        !state.isAutoScale;

    update(false);
}

function toggleStepMode(){

    stepMode = !stepMode;

    currentStep = 0;

    document.getElementById('b-step-mode')
        .textContent =
            stepMode
                ? "MODO NORMAL"
                : "PASO A PASO";

    update(true);
}

function nextStep(){

    if(!stepMode)
        return;

    currentStep++;

    if(currentStep > 5)
        currentStep = 0;

    update(true);
}

/* =========================================================
   EVENTOS
========================================================= */

window.onload = () => {

    document.getElementById('sf')
        .onchange = () => update(true);

    document.getElementById('sh')
        .onchange = () => update(true);

    document.getElementById('freq')
        .oninput = () => update(false);

    document.getElementById('width')
        .oninput = () => update(false);

    document.getElementById('st')
        .oninput = () => update(false);

    document.getElementById('b-mode')
        .onclick = toggleMode;

    document.getElementById('b-causal')
        .onclick = toggleCausal;

    document.getElementById('b-type')
        .onclick = togglePeriodic;

    document.getElementById('b-scale')
        .onclick = toggleScale;

    document.getElementById('b-play')
        .onclick = togglePlay;

    document.getElementById('b-step-mode')
        .onclick = toggleStepMode;

    document.getElementById('b-step-next')
        .onclick = nextStep;

    document.getElementById('b-freeze')
        .onclick = () => {
        freezeIntegral = !freezeIntegral;
        const b =
            document.getElementById(
            'b-freeze'
            );

        if(freezeIntegral){
            b.textContent = "t CONGELADO";
            b.style.background =
                "#e74c3c";
            b.style.color = "white";
        }else{
            b.textContent =
                "CONGELAR t";
            b.style.background = "";
            b.style.color = "";
        }
};
    update(true);
};
