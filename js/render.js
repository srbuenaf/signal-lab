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

/* ==========================================================================
       RESET
       ========================================================================== */
    const integWindow = document.getElementById('view-integ-window');
    const ghostReset = document.getElementById('integral-ghost');
    
    // Si el paso actual en este render (currentStep) es DIFERENTE al paso que 
    // ejecutó el render anterior (window.previousStep), significa que el usuario 
    // acaba de pulsar "Siguiente" o "Atrás". ¡Es un cambio de paso real!
    const esCambioDePasoReal = (typeof window.previousStep !== 'undefined' && window.previousStep !== currentStep);

    if (ghostReset && esCambioDePasoReal) {
        ghostReset.style.transition = 'none';
        ghostReset.style.opacity = '0';
    }

    // Si el usuario se ha ido del Paso 6 (currentStep !== 5), reseteamos el tracker
    // para que la próxima vez que vuelva a entrar sepa que viene desde fuera.
    if (currentStep !== 5) {
        window.previousStep = currentStep;
    }

    integWindow.style.display = 'none';
    integWindow.setAttribute('width', 0);
    
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

    for(let x=0; x<=500; x++){
        const vF = signalBuffer[x];
        const vH = kernelBuffer[x];

        if(Math.abs(vF) > 1 && Math.abs(vH) > 1){
            overlapStart = Math.min(overlapStart, x);
            overlapEnd = Math.max(overlapEnd, x);
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

        // Eliminamos las clases activas en modo normal
        focusH?.classList.remove('active');
        focusProd?.classList.remove('active');
        focusRes?.classList.remove('active');
   
        resCurve.style.opacity = '';
        resFill.style.opacity = '';
        return;
    }

    /* =========================
       PASOS (PREPARACIÓN)
    ========================= */
    let previousStep = -1; // Almacena el último paso renderizado para controlar las transiciones

    document.getElementById('didactic-panel').style.display = 'block';
        
    resCurve.classList.add('result-focus');
    resFill.classList.add('result-focus');
    resPoint.style.opacity = 0;
    resPoint.classList.remove('result-point-focus');
    
    // Reseteamos el estado elástico de las cajas usando clases CSS
    focusH?.classList.remove('active');
    focusProd?.classList.remove('active');
    focusRes?.classList.remove('active');    

    switch(currentStep){

        /* PASO 1 */
        case 0:
            resPoint.style.opacity = 0;
            focusH?.classList.add('active'); // Enciende la envoltura malva responsiva del filtro

            title.textContent = "Paso 1: Kernel original h(τ)";
            title.style.borderLeftColor = "#009688";

            base.style.opacity = 1;
            document.getElementById('didactic-title').textContent = "Paso 1 · Sistema original";
            document.getElementById('didactic-text').textContent = "Observamos la respuesta impulsional original del sistema h(τ). Esta función describe cómo responde físicamente el sistema ante una excitación.";
            previousStep = currentStep;
            break;

        /* PASO 2 */
        case 1:
            focusH?.classList.add('active'); // Sigue en el filtro
            title.textContent = state.isConvolution ? "Paso 2: Inversión temporal h(-τ)" : "Paso 2: Correlación: no se invierte";
            title.style.borderLeftColor = "#2980b9";

            base.style.opacity = 0.15;
            flip.style.opacity = 1;

            document.getElementById('didactic-title').textContent = "Paso 2 · Inversión temporal";
            document.getElementById('didactic-text').textContent = "En convolución invertimos temporalmente el sistema. El operador h(t-τ) implica una reflexión respecto al eje temporal.";
            previousStep = currentStep;
            break;

        /* PASO 3 */
        case 2:
            focusH?.classList.add('active'); // Sigue en el filtro
            title.textContent = "Paso 3: Desplazamiento h(t-τ)";
            title.style.borderLeftColor = "#2980b9";

            flip.style.opacity = 0.15;
            moved.style.opacity = 1;
            overlap.style.display = 'block';

            document.getElementById('didactic-title').textContent = "Paso 3 · Desplazamiento temporal";
            document.getElementById('didactic-text').textContent = "Ahora desplazamos el sistema a lo largo del tiempo. El parámetro t controla cuánto se mueve el kernel respecto a la señal.";
            previousStep = currentStep;
            break;

        /* PASO 4 */
        case 3:
            focusProd?.classList.add('active'); // Se traslada a la gráfica del Producto punto a punto
            title.textContent = "Paso 4: Producto punto a punto";
            title.style.borderLeftColor = "#9c27b0";

            moved.style.opacity = 0.25;
            prod.style.opacity = 1;
            overlap.style.opacity = 1;
            overlap.style.display = 'block';

            document.getElementById('didactic-title').textContent = "Paso 4 · Producto local";
            document.getElementById('didactic-text').textContent = "Multiplicamos punto a punto ambas señales. El solape positivo aumenta la salida; el solape negativo puede cancelarla.";
            previousStep = currentStep;
            break;

/* PASO 5: Simulación de integración con barrido dinámico */
        case 4:
            focusProd?.classList.add('active'); // Mantiene el foco en el producto
            integWindow.style.display = 'block';

            // 1. Inicializamos en el extremo izquierdo si acaba de entrar al paso
            if (integWindow.getAttribute('width') === '0' || !integWindow.getAttribute('width')) {
                integWindow.setAttribute('x', 0);
                integWindow.setAttribute('width', 0);
            }

            // 2. Ejecutamos el barrido automático hacia la derecha con suavidad
            setTimeout(() => {
                integWindow.setAttribute('width', 500); // Se expande barriendo todo el eje de tau
            }, 50);
            
            title.textContent = "Paso 5: La integral se está calculando ...";
            title.style.borderLeftColor = "#e74c3c";

            moved.style.opacity = 0.25;
            prod.style.transition = 'opacity .45s ease';
            prod.style.opacity = 1;
            overlap.style.opacity = 1;

            document.getElementById('didactic-title').textContent = "Paso 5 · Integración";
            document.getElementById('didactic-text').textContent = "La integral acumula de izquierda a derecha toda la interacción entre señal y sistema. El área sombreada final generará un único punto de la salida y(t).";
            
            resCurve.classList.add('result-focus');
            resFill.classList.add('result-focus');
            
            overlap.style.transition = 'opacity .45s ease';
            overlap.classList.remove('overlap-fade');
            overlap.style.opacity = 1;
            
            resPoint.style.opacity = 0;
            resPoint.classList.remove('result-point-focus');
            
            integWindow.classList.remove('window-fade');
            integWindow.style.opacity = 1;
            previousStep = currentStep;
            break;

/* PASO 6: Asignación a y(t) con interruptor de cambio de paso (CORREGIDO) */
        case 5:
            const ghost = document.getElementById('integral-ghost');
            const realWindow = document.getElementById('view-integ-window');
            
            // CANDADO: Verificamos si acabamos de aterrizar en el Paso 6 desde otro paso
            // Si window.previousStep no está definido, o es distinto de 5, es la primera vez.
            const esPrimeraVezEnElPaso = (typeof window.previousStep === 'undefined' || window.previousStep !== 5);

            if (!esPrimeraVezEnElPaso) { 
                // ==========================================
                // MODO FIJO (Usuario moviendo el slider 't')
                // ==========================================
                if (ghost) ghost.style.opacity = '0';
                if (realWindow) {
                    realWindow.style.display = 'none';
                    realWindow.setAttribute('width', '0');
                }
                
                // Mantenemos el punto malva y el highlight fijos en tiempo real
                resPoint.style.transition = 'none';
                resPoint.style.fill = '#9c27b0';
                resPoint.style.opacity = 1;
                resPoint.classList.add('result-point-focus');
                
                focusRes?.classList.add('active');

            } else {
                // ==========================================
                // MODO CINEMÁTICO (Solo al pulsar "Siguiente")
                // ==========================================
                if (ghost && realWindow) {
                    // 1. Forzamos la aparición del bloque morado para medirlo en pantalla
                    realWindow.style.display = 'block';
                    realWindow.style.opacity = '1';
                    realWindow.setAttribute('width', '500'); 

                    const rectInteg = realWindow.getBoundingClientRect();
                    const targetPoint = resPoint.getBoundingClientRect();
                    
                    // 2. Posicionamos el clon fantasma exactamente encima
                    ghost.style.transition = 'none';
                    ghost.style.left = `${rectInteg.left + window.scrollX}px`;
                    ghost.style.top = `${rectInteg.top + window.scrollY}px`;
                    ghost.style.width = `${rectInteg.width}px`;
                    ghost.style.height = `${rectInteg.height}px`;
                    ghost.style.opacity = '1';
                    
                    void ghost.offsetWidth; // Forzamos renderizado geométrico inmediato
                    
                    // 3. Ocultamos el bloque original del SVG
                    realWindow.style.display = 'none';
                    realWindow.setAttribute('width', '0');
                    
                    // 4. Lanzamos la succión sutil hacia abajo
                    setTimeout(() => {
                        ghost.style.transition = `
                            left 0.6s cubic-bezier(0.25, 1, 0.5, 1),
                            top 0.6s cubic-bezier(0.25, 1, 0.5, 1),
                            width 0.6s cubic-bezier(0.25, 1, 0.5, 1),
                            height 0.6s cubic-bezier(0.25, 1, 0.5, 1),
                            opacity 0.6s ease-in
                        `;
                        
                        ghost.style.left = `${targetPoint.left + window.scrollX + (targetPoint.width / 2)}px`;
                        ghost.style.top = `${targetPoint.top + window.scrollY + (targetPoint.height / 2)}px`;
                        ghost.style.width = '2px';   
                        ghost.style.height = '2px';
                        ghost.style.opacity = '0';   
                        
                        // 5. Al aterrizar el punto, revelamos el punto e iluminamos la gráfica inferior
                        setTimeout(() => {
                            resPoint.style.transition = 'opacity .25s ease, transform .25s ease';
                            resPoint.style.fill = '#9c27b0';
                            resPoint.style.opacity = 1;
                            resPoint.classList.add('result-point-focus');
                            
                            focusRes?.classList.add('active'); 
                        }, 600);
                        
                    }, 50);
                }
            }

            // Entorno de opacidades y textos del laboratorio
            moved.style.opacity = 0.12;
            prod.style.transition = 'opacity .45s ease';
            prod.style.opacity = 0.08;
            overlap.style.transition = 'opacity .45s ease';
            overlap.classList.add('overlap-fade');

            title.textContent = "Paso 6: Asignación a y(t)";
            title.style.borderLeftColor = "#2ecc71";

            document.getElementById('didactic-title').textContent = "Paso 6 · Construcción de la salida";
            document.getElementById('didactic-text').textContent = "El valor de la integral se condensa directamente hacia abajo, convirtiéndose en un punto único de la curva de salida y(t). Mueve el slider para explorar otros puntos.";

            // Guardamos de forma segura el paso actual en el objeto window
            window.previousStep = currentStep; 
            break;
    }
}