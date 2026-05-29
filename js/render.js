function renderMiniSignals(paths){

    document.getElementById('path-f')
        .setAttribute(
            'd',
            paths.dF + " L500 0 Z"
        );

    document.getElementById('path-h')
        .setAttribute(
            'd',
            paths.dH + " L500 0 Z"
        );

    document.getElementById('path-h-base')
        .setAttribute(
            'd',
            paths.dBase + " L500 0 Z"
        );

    document.getElementById('path-h-flip')
        .setAttribute(
            'd',
            paths.dHF + " L500 0 Z"
        );

    document.getElementById('path-prod')
        .setAttribute(
            'd',
            paths.dP + " L500 0 Z"
        );

    document.getElementById('path-overlay-f')
        .setAttribute(
            'd',
            paths.dOF + " L500 0 Z"
        );
        
    document.getElementById('path-overlay-h'
      ).setAttribute(
          'd',
          paths.dOverlayH + " L500 0 Z"
      );
}

function renderResponse(scanData){

    const {scan,maxAbs} = scanData;

    const mSVG =
        state.isAutoScale
            ? (maxAbs >0 ? 35/maxAbs : 10)
            : 35/60;

    const mOverlay =
        state.isAutoScale
            ? (maxAbs >0 ? 160/maxAbs : 30)
            : 160/60;

    let dRes = "";
    let dOver = "";

    scan.forEach((p,i)=>{

        if(stepMode){
            let visibleT = state.t;
            if(currentStep < 5){
                visibleT -= 1;
            }
            if(p.t > visibleT)
                return;
        }

        const py = p.val * mSVG;
        const poy = p.val * mOverlay;

        if(i===0){
            dRes = `M${p.x} ${-py}`;
            dOver = `M${p.x} ${-poy}`;
        }else{
            dRes += ` L${p.x} ${-py}`;
            dOver += ` L${p.x} ${-poy}`;
        }
    });

    document.getElementById('path-res')
        .setAttribute('d',dRes);

    document.getElementById('path-res-fill')
        .setAttribute(
            'd',
            dRes + " L500 0 L0 0 Z"
        );

    document.getElementById('path-overlay-res')
        .setAttribute(
            'd',
            dOver
        );

    const currentY =
        scan.find(
            p => p.x >= state.sliderT
        )?.val || 0;

    document.getElementById('p4')
        .setAttribute('cx',state.sliderT);

    document.getElementById('p4')
        .setAttribute(
            'cy',
            -currentY * mSVG
        );

    document.getElementById('p-overlay-res')
        .setAttribute('cx',state.sliderT);

    document.getElementById('p-overlay-res')
        .setAttribute(
            'cy',
            -currentY * mOverlay
        );

    document.getElementById('overlay-time-line')
        .setAttribute('x1',state.sliderT);

    document.getElementById('overlay-time-line')
        .setAttribute('x2',state.sliderT);

    let maxPrinted =
        state.isPeriodicMode
            ? maxAbs
            : maxAbs * 2;

    document.getElementById('text-max')
        .textContent =
            `Max: ${maxPrinted.toFixed(2)}`;

    document.getElementById('text-gain')
        .textContent =
            `Ganancia G: ${(maxPrinted/40).toFixed(2)}x`;
}

function renderGuides(){

    for(let i=1;i<=4;i++){
        const g = document.getElementById(`guide-${i}`);
        g.setAttribute('x1',state.sliderT);
        g.setAttribute('x2',state.sliderT);
    }
}

function renderLabels(forceMath){

    if(!forceMath)
        return;

    const sSelect = document.getElementById('sf');
    const hSelect = document.getElementById('sh');

    const sName = sSelect.options[sSelect.selectedIndex].text;
    const hName = hSelect.options[hSelect.selectedIndex].text;

    document.getElementById('latex-f')
        .textContent = `Gráfica 1: Entrada f(τ) — [${sName}]`;

    document.getElementById('latex-h')
        .textContent = `Gráfica 2: Sistema h(${state.isConvolution ? 't-τ':'τ-t'}) — [${hName}]`;

    document.getElementById('latex-prod')
        .textContent =
            state.isPeriodicMode
                ? "Gráfica 3: Producto Periódico"
                : "Gráfica 3: Intersección";

    let resTitle = "";

    if(state.isPeriodicMode){
        resTitle =
            state.isConvolution
                ? `\\( \\tilde{y}(t)=\\frac{1}{T}\\int_{t-T}^{t}\\tilde{f}(\\tau)\\tilde{h}(t-\\tau)d\\tau \\)`
                : `\\( \\tilde{R}(t)=\\frac{1}{T}\\int_{t-T}^{t}\\tilde{f}(\\tau)\\tilde{h}(\\tau-t)d\\tau \\)`;
    }else{
        resTitle =
            state.isConvolution
                ? `\\( (f*h)(t)=\\int_{-250}^{250}f(\\tau)h(t-\\tau)d\\tau \\)`
                : `\\( (f\\star h)(t)=\\int_{-250}^{250}f(\\tau)h(\\tau-t)d\\tau \\)`;
    }

    document.getElementById('latex-res')
        .innerHTML = resTitle;

    if(window.MathJax)
        MathJax.typesetPromise();
}

function renderButtons(){

    const bMode = document.getElementById('b-mode');
    const bCausal = document.getElementById('b-causal');
    const bType = document.getElementById('b-type');
    const bScale = document.getElementById('b-scale');

    bMode.textContent = state.isConvolution ? "CONVOLUCIÓN" : "CORRELACIÓN";
    bCausal.textContent = state.isCausal ? "CAUSAL REAL" : "NO CAUSAL";
    bType.textContent = state.isPeriodicMode ? "CONVOLUCIÓN CIRCULAR" : "LINEAL GLOBAL";
    bScale.textContent = state.isAutoScale ? "Escala: AUTO" : "Escala: FIJA";
}

function renderStepMode(){

    const title = document.getElementById('latex-overlay-title');
    const base = document.getElementById('path-h-base');
    const flip = document.getElementById('path-h-flip');
    const moved = document.getElementById('path-h');
    const prod = document.getElementById('path-prod');
    const overlap = document.getElementById('path-overlap-fill');
    const resCurve = document.getElementById('path-res');
    const resFill = document.getElementById('path-res-fill');
    const resPoint = document.getElementById('p4');
    const overlapBox = document.getElementById('active-overlap');

    const focusH = document.getElementById('focus-h');
    const focusProd = document.getElementById('focus-prod');
    const focusRes = document.getElementById('focus-res');

    /* =========================
       RESET
    ========================= */
    const integWindow = document.getElementById('view-integ-window');

    integWindow.style.display = 'none';
    base.style.opacity = 0;
    flip.style.opacity = 0;
    moved.style.opacity = 0;
    prod.style.opacity = 0;
    overlap.style.opacity = 0;
    overlap.style.display = 'none';

    /* =========================
       MODO NORMAL
    ========================= */
    let overlapStart = 999;
    let overlapEnd = -999;

    for(let x=0;x<=500;x++){
        const vF = signalBuffer[x];
        const vH = kernelBuffer[x];

        if(Math.abs(vF) > 1 && Math.abs(vH) > 1){
            overlapStart = Math.min(overlapStart,x);
            overlapEnd = Math.max(overlapEnd,x);
        }
    }

    if(overlapEnd > overlapStart){
        overlapBox.style.display = 'block';
        overlapBox.setAttribute('x', overlapStart);
        overlapBox.setAttribute('y', -55);
        overlapBox.setAttribute('width', overlapEnd - overlapStart);
        overlapBox.setAttribute('height', 110);
    }else{
        overlapBox.style.display = 'none';
    }

    if(!stepMode){
        title.textContent = "";
        base.style.opacity = 0.18;
        flip.style.opacity = 0.45;
        moved.style.opacity = 1;
        prod.style.opacity = 1;
        overlap.style.opacity = 1;

        document.getElementById('didactic-panel').style.display = 'none';

        resCurve.classList.remove('result-focus');
        resFill.classList.remove('result-focus');
        resPoint.classList.remove('result-point-focus');

        focusH.style.opacity = 0;
        focusProd.style.opacity = 0;
        focusRes.style.opacity = 0;
   
        resCurve.style.opacity = '';
        resFill.style.opacity = '';
        return;
    }

    /* =========================
       PASOS
    ========================= */
    document.getElementById('didactic-panel').style.display = 'block';
        
    resCurve.classList.add('result-focus');
    resFill.classList.add('result-focus');
    resPoint.style.opacity = 0;
    resPoint.classList.remove('result-point-focus');
    
    focusH.style.opacity = 0;
    focusProd.style.opacity = 0;
    focusRes.style.opacity = 0;    

    switch(currentStep){

        /* PASO 1 */
        case 0:
            resPoint.style.opacity = 0;
            focusH.style.opacity = 1;   

            title.textContent = "Paso 1: Kernel original h(τ)";
            title.style.borderLeftColor = "#009688";

            base.style.opacity = 1;
            document.getElementById('didactic-title').textContent = "Paso 1 · Sistema original";
            document.getElementById('didactic-text').textContent = "Observamos la respuesta impulsional original del sistema h(τ). Esta función describe cómo responde físicamente el sistema ante una excitación.";
            break;

        /* PASO 2 */
        case 1:
            focusH.style.opacity = 1;   
            title.textContent = state.isConvolution ? "Paso 2: Inversión temporal h(-τ)" : "Paso 2: Correlación: no se invierte";
            title.style.borderLeftColor = "#2980b9";

            base.style.opacity = 0.15;
            flip.style.opacity = 1;

            document.getElementById('didactic-title').textContent = "Paso 2 · Inversión temporal";
            document.getElementById('didactic-text').textContent = "En convolución invertimos temporalmente el sistema. El operador h(t-τ) implica una reflexión respecto al eje temporal.";
            break;

        /* PASO 3 */
        case 2:
            focusH.style.opacity = 1;   
            title.textContent = "Paso 3: Desplazamiento h(t-τ)";
            title.style.borderLeftColor = "#2980b9";

            flip.style.opacity = 0.15;
            moved.style.opacity = 1;
            overlap.style.display = 'block';

            document.getElementById('didactic-title').textContent = "Paso 3 · Desplazamiento temporal";
            document.getElementById('didactic-text').textContent = "Ahora desplazamos el sistema a lo largo del tiempo. El parámetro t controla cuánto se mueve el kernel respecto a la señal.";
            break;

        /* PASO 4 */
        case 3:
            focusProd.style.opacity = 1;
            title.textContent = "Paso 4: Producto punto a punto";
            title.style.borderLeftColor = "#9c27b0";

            moved.style.opacity = 0.25;
            prod.style.opacity = 1;
            overlap.style.opacity = 1;
            overlap.style.display = 'block';

            document.getElementById('didactic-title').textContent = "Paso 4 · Producto local";
            document.getElementById('didactic-text').textContent = "Multiplicamos punto a punto ambas señales. El solape positivo aumenta la salida; el solape negativo puede cancelarla.";
            break;

        /* PASO 5 */
        case 4:
            focusProd.style.opacity = 1;
            integWindow.style.display = 'block';

            integWindow.setAttribute('x', 0);
            integWindow.setAttribute('width', 500);
            
            title.textContent = "Paso 5: La integral se está calculando ...";
            title.style.borderLeftColor = "#e74c3c";

            moved.style.opacity = 0.25;
            prod.style.transition = 'opacity .45s ease';
            prod.style.opacity = 1;
            overlap.style.opacity = 1;

            document.getElementById('didactic-title').textContent = "Paso 5 · Integración";
            document.getElementById('didactic-text').textContent = "La integral acumula toda la interacción entre señal y sistema. El valor obtenido genera un único punto de la salida y(t).";
            
            resCurve.classList.add('result-focus');
            resFill.classList.add('result-focus');
            
            overlap.style.transition = 'opacity .45s ease';
            overlap.classList.remove('overlap-fade');
            overlap.style.opacity = 1;
            
            resPoint.style.opacity = 0;
            resPoint.classList.remove('result-point-focus');
            
            integWindow.classList.remove('window-fade');
            integWindow.style.opacity = 1;
            break;

        /* PASO 6 */
        case 5:
            focusRes.style.opacity = 1;
            integWindow.style.display = 'block';
            integWindow.style.opacity = 0;

            moved.style.opacity = 0.12;
            prod.style.transition = 'opacity .45s ease';
            prod.style.opacity = 0.08;

            overlap.style.transition = 'opacity .45s ease';
            overlap.classList.add('overlap-fade');

            title.textContent = "Paso 6: Asignación a y(t)";
            title.style.borderLeftColor = "#2ecc71";

            document.getElementById('didactic-title').textContent = "Paso 6 · Construcción de la salida";
            document.getElementById('didactic-text').textContent = "El valor de la integral se convierte en un punto de la convolución y(t).";

            resPoint.style.transition = 'opacity .45s ease';
            resPoint.style.opacity = 1;
            resPoint.classList.add('result-point-focus');

            integWindow.classList.add('window-fade');
            previousT = state.t;
            break;
    }
}