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
    
    // Contenedor del panel derecho para controlar su mutación visual
    const panelRight = document.getElementById('panel-right-container');

    /* ==========================================================================
       RESET GENERAL
       ========================================================================== */
    const integWindow = document.getElementById('view-integ-window');
    const ghostReset = document.getElementById('integral-ghost');
    
    const esCambioDePasoReal = (typeof window.previousStep !== 'undefined' && window.previousStep !== currentStep);

    if (ghostReset && esCambioDePasoReal) {
        ghostReset.style.transition = 'none';
        ghostReset.style.opacity = '0';
    }

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

    // Limpieza absoluta de los títulos flotantes del panel izquierdo
    const stepLabels = document.querySelectorAll('.step-title-label');
    stepLabels.forEach(lbl => {
        lbl.textContent = "";
        lbl.classList.remove('active');
        lbl.style.background = "none";
        lbl.style.color = "inherit";
    });

    /* ==========================================================
       MODO NORMAL (Restauramos el Canvas Derecho Superpuesto)
    ========================================================== */
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
        // Apagamos la mutación del panel derecho
        panelRight?.classList.remove('step-mode-active');
        
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

        focusH?.classList.remove('active');
        focusProd?.classList.remove('active');
        focusRes?.classList.remove('active');
   
        resCurve.style.opacity = '';
        resFill.style.opacity = '';
        return;
    }

    /* ==========================================================
       MODO PASO A PASO (MUTACIÓN COMPLETA DEL PANEL DERECHO)
    ========================================================== */
    panelRight?.classList.add('step-mode-active');
    document.getElementById('didactic-panel').style.display = 'flex';
        
    resCurve.classList.add('result-focus');
    resFill.classList.add('result-focus');
    resPoint.style.opacity = 0;
    resPoint.classList.remove('result-point-focus');
    
    focusH?.classList.remove('active');
    focusProd?.classList.remove('active');
    focusRes?.classList.remove('active');    

    // Capturadores específicos de las etiquetas del panel izquierdo
    const lblF = document.getElementById('lbl-step-f');
    const lblH = document.getElementById('lbl-step-h');
    const lblProd = document.getElementById('lbl-step-prod');
    const lblRes = document.getElementById('lbl-step-res');

    switch(currentStep){

        /* PASO 1 */
        case 0:
            resPoint.style.opacity = 0;
            focusH?.classList.add('active'); 
            base.style.opacity = 1; 

            // 1. Título sobre la Gráfica 2
            if(lblH) {
                lblH.textContent = "Paso 1: Kernel original h(τ)";
                lblH.style.background = "var(--inverse-light)";
                lblH.style.color = "var(--inverse)";
                lblH.classList.add('active');
            }

            // 2. Explicación Académica Ampliada en el Panel Derecho entero
            document.getElementById('didactic-title').textContent = "Paso 1 · Análisis de la Respuesta Impulsional";
            document.getElementById('didactic-text').innerHTML = `
                <p>Para iniciar cualquier proceso de filtrado o convolución lineal, el primer paso fundamental consiste en aislar y estudiar matemáticamente la respuesta al impulso del sistema, denotada como <b>h(τ)</b>.</p>
                <p>Esta función describe de forma unívoca el comportamiento dinámico y físico del circuito o filtro ante una excitación ideal instantánea (una delta de Dirac). En esta pantalla puedes ver el kernel en su estado natural (color verde suave sólido con cerco oscuro definido).</p>
                <ul>
                    <li>El eje horizontal representa la variable de integración de tiempo interno <b>τ (tau)</b>.</li>
                    <li>La geometría de esta curva determinará qué frecuencias de la señal de entrada serán atenuadas, suavizadas o amplificadas a lo largo del proceso.</li>
                </ul>
            `;
            break;

        /* PASO 2 */
        case 1:
            focusH?.classList.add('active'); 
            base.style.opacity = 0.35; 
            flip.style.opacity = 1;

            // 1. Título sobre la Gráfica 2
            if(lblH) {
                lblH.textContent = state.isConvolution ? "Paso 2: Inversión temporal h(-τ)" : "Paso 2: Correlación h(τ)";
                lblH.style.background = "#e0f7fa";
                lblH.style.color = "var(--accent)";
                lblH.classList.add('active');
            }

            // 2. Explicación Académica Ampliada en el Panel Derecho entero
            document.getElementById('didactic-title').textContent = state.isConvolution ? "Paso 2 · Inversión Temporal (Efecto Espejo)" : "Paso 2 · Propiedades de la Correlación";
            
            if(state.isConvolution) {
                document.getElementById('didactic-text').innerHTML = `
                    <p>La naturaleza matemática del operador de convolución exige una <b>reflexión temporal</b> del sistema respecto al eje vertical, transformando la función h(τ) en <b>h(-τ)</b>.</p>
                    <p>Este vuelco de 180° es un requerimiento físico y crítico para modelar sistemas lineales e invariantes en el tiempo (LTI) que respeten el principio de causalidad. Al invertir el kernel, garantizamos que los eventos pasados de la entrada afecten al presente de la salida, y no al revés.</p>
                    <p><b>Visualización en el laboratorio:</b> Fíjate en la Gráfica 2. La curva verde sólido representa el filtro volteado, mientras que la silueta atenuada y con trazo discontinuo del fondo te sirve de referencia estática para apreciar el efecto espejo respecto al origen.</p>
                `;
            } else {
                document.getElementById('didactic-text').innerHTML = `
                    <p>Al haber seleccionado el operador de <b>CORRELACIÓN</b>, la teoría estadística nos indica que <b>no debe aplicarse ninguna inversión temporal</b> sobre el filtro.</p>
                    <p>A diferencia de la convolución, la correlación no busca calcular la salida de un sistema físico, sino medir el grado de similitud lineal entre dos señales a medida que una se desplaza sobre la otra.</p>
                    <p>Por lo tanto, en este paso verás que la función mantiene su orientación original intacta para evaluar la coincidencia geométrica de forma directa.</p>
                `;
            }
            break;

        /* PASO 3 */
        case 2:
            focusH?.classList.add('active'); 
            flip.style.opacity = 0.15;
            moved.style.opacity = 1;
            overlap.style.display = 'block';

            // 1. Título sobre la Gráfica 2
            if(lblH) {
                lblH.textContent = "Paso 3: Desplazamiento h(t-τ)";
                lblH.style.background = "#e1f5fe";
                lblH.style.color = "var(--accent)";
                lblH.classList.add('active');
            }

            // 2. Explicación Académica Ampliada en el Panel Derecho entero
            document.getElementById('didactic-title').textContent = "Paso 3 · Desplazamiento Temporal (Variable t)";
            document.getElementById('didactic-text').innerHTML = `
                <p>Una vez preparado el filtro, se introduce la variable de observación externa <b>t</b>, lo que convierte a nuestra función en <b>h(t - τ)</b>.</p>
                <p>El parámetro <b>t</b> actúa como un motor de desplazamiento que traslada el kernel a lo largo de todo el dominio de la señal de entrada:</p>
                <ul>
                    <li>Si <b>t < 0</b>, el filtro se desplaza hacia la izquierda (pasado).</li>
                    <li>Si <b>t = 0</b>, el filtro se ubica exactamente en el origen temporal.</li>
                    <li>Si <b>t > 0</b>, el filtro avanza suavemente hacia la derecha (futuro).</li>
                </ul>
                <p>Usa libremente el <b>Slider de Tiempo (t)</b> en el panel de exploración inferior. Verás cómo la curva verde se desplaza dinámicamente simulando el avance cronológico continuo del sistema.</p>
            `;
            break;

        /* PASO 4 */
        case 3:
            focusProd?.classList.add('active'); 
            moved.style.opacity = 0.25;
            prod.style.opacity = 1;
            overlap.style.opacity = 1;
            overlap.style.display = 'block';

            // 1. Título sobre la Gráfica 3
            if(lblProd) {
                lblProd.textContent = "Paso 4: Producto punto a punto";
                lblProd.style.background = "var(--mix-light)";
                lblProd.style.color = "var(--mix)";
                lblProd.classList.add('active');
            }

            // 2. Explicación Académica Ampliada en el Panel Derecho entero
            document.getElementById('didactic-title').textContent = "Paso 4 · Multiplicación Concomitante Local";
            document.getElementById('didactic-text').innerHTML = `
                <p>Con el filtro posicionado en un instante <b>t</b> específico, descendemos a la Gráfica 3 para calcular el **producto interno local**: $f(\tau) \cdot h(t - \tau)$.</p>
                <p>El sistema multiplica de forma concomitante el valor exacto de la señal de entrada por el valor del filtro en cada punto coordenado de tau $\tau$. El resultado es la curva morada que ves en pantalla:</p>
                <ul>
                    <li>Si ambas señales tienen el mismo signo en una zona, el producto genera un área positiva.</li>
                    <li>Si tienen signos opuestos, se generan valles negativos.</li>
                    <li>En las regiones donde no existe solape físico, el resultado es estrictamente cero.</li>
                </ul>
            `;
            break;

        /* PASO 5 */
        case 4:
            focusProd?.classList.add('active'); 
            integWindow.style.display = 'block';

            if (integWindow.getAttribute('width') === '0' || !integWindow.getAttribute('width')) {
                integWindow.setAttribute('x', 0);
                integWindow.setAttribute('width', 0);
            }

            setTimeout(() => { integWindow.setAttribute('width', 500); }, 50);
            
            moved.style.opacity = 0.25;
            prod.style.transition = 'opacity .45s ease';
            prod.style.opacity = 1;
            overlap.style.opacity = 1;
            resCurve.classList.add('result-focus');
            resFill.classList.add('result-focus');
            overlap.style.transition = 'opacity .45s ease';
            overlap.classList.remove('overlap-fade');
            overlap.style.opacity = 1;
            resPoint.style.opacity = 0;
            resPoint.classList.remove('result-point-focus');
            integWindow.classList.remove('window-fade');
            integWindow.style.opacity = 1;

            // 1. Título sobre la Gráfica 3
            if(lblProd) {
                lblProd.textContent = "Paso 5: Cálculo del área bajo la curva";
                lblProd.style.background = "var(--result-light)";
                lblProd.style.color = "var(--result)";
                lblProd.classList.add('active');
            }

            // 2. Explicación Académica Ampliada en el Panel Derecho entero
            document.getElementById('didactic-title').textContent = "Paso 5 · El Operador Integral Acumulativo";
            document.getElementById('didactic-text').innerHTML = `
                <p>La esencia matemática de la convolución se consolida en este paso mediante la **integración definida**: $\int_{-\infty}^{\infty} f(\tau)h(t-\tau)d\tau$.</p>
                <p>La ventana de sombreado que barre el lienzo ejecuta una suma continua del área neta encerrada bajo la curva del producto obtenida en el paso anterior. Las áreas positivas suman volumen, mientras que las negativas restan por cancelación de fase.</p>
                <p>Este valor acumulado total representa la fuerza o intensidad de la interacción de la señal con el filtro **únicamente para el instante de tiempo actual $t$**.</p>
            `;
            break;

        /* PASO 6 */
        case 5:
            const ghost = document.getElementById('integral-ghost');
            const realWindow = document.getElementById('view-integ-window');
            const esPrimeraVezEnElPaso = (window.previousStep !== 5);

            if (!esPrimeraVezEnElPaso) { 
                if (ghost) ghost.style.opacity = '0';
                if (realWindow) {
                    realWindow.style.display = 'none';
                    realWindow.setAttribute('width', '0');
                }
                resPoint.style.transition = 'none';
                resPoint.style.fill = '#9c27b0';
                resPoint.style.opacity = 1;
                resPoint.classList.add('result-point-focus');
                focusRes?.classList.add('active');
            } else {
                if (ghost && realWindow) {
                    realWindow.style.display = 'block';
                    realWindow.style.opacity = '1';
                    realWindow.setAttribute('width', '500'); 

                    const rectInteg = realWindow.getBoundingClientRect();
                    const targetPoint = resPoint.getBoundingClientRect();
                    
                    ghost.style.transition = 'none';
                    ghost.style.left = `${rectInteg.left + window.scrollX}px`;
                    ghost.style.top = `${rectInteg.top + window.scrollY}px`;
                    ghost.style.width = `${rectInteg.width}px`;
                    ghost.style.height = `${rectInteg.height}px`;
                    ghost.style.opacity = '1';
                    
                    void ghost.offsetWidth; 
                    
                    realWindow.style.display = 'none';
                    realWindow.setAttribute('width', '0');
                    
                    setTimeout(() => {
                        ghost.style.transition = `left 0.6s cubic-bezier(0.25, 1, 0.5, 1), top 0.6s cubic-bezier(0.25, 1, 0.5, 1), width 0.6s cubic-bezier(0.25, 1, 0.5, 1), height 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease-in`;
                        ghost.style.left = `${targetPoint.left + window.scrollX + (targetPoint.width / 2)}px`;
                        ghost.style.top = `${targetPoint.top + window.scrollY + (targetPoint.height / 2)}px`;
                        ghost.style.width = '2px';   
                        ghost.style.height = '2px';
                        ghost.style.opacity = '0';   
                        
                        setTimeout(() => {
                            resPoint.style.transition = 'opacity .25s ease, transform .25s ease';
                            resPoint.style.fill = '#9c27b0';
                            resPoint.style.opacity = 1;
                            resPoint.classList.add('result-point-focus');
                            focusRes?.classList.add('active'); 
                        }, 600);
                    }, 50);
                }
                window.previousStep = 5;
            }

            moved.style.opacity = 0.12;
            prod.style.transition = 'opacity .45s ease';
            prod.style.opacity = 0.08;
            overlap.style.transition = 'opacity .45s ease';
            overlap.classList.add('overlap-fade');

            // 1. Título sobre la Gráfica 4
            if(lblRes) {
                lblRes.textContent = "Paso 6: Salida mapeada y(t)";
                lblRes.style.background = "#e8f5e9";
                lblRes.style.color = "#2ecc71";
                lblRes.classList.add('active');
            }

            // 2. Explicación Académica Ampliada en el Panel Derecho entero
            document.getElementById('didactic-title').textContent = "Paso 6 · Mapeo Final de la Señal de Salida y(t)";
            document.getElementById('didactic-text').innerHTML = `
                <p>En esta etapa de cierre, el valor numérico escalar obtenido de la integral anterior **colapsa físicamente hacia abajo**, convirtiéndose en un punto único (el punto malva) de la Gráfica 4.</p>
                <p>Este punto representa la amplitud de la señal de salida final $y(t)$ en el instante exacto evaluado. Al repetir consecutivamente este barrido completo para cada infinitésimo de tiempo, los puntos van dibujando la curva continua roja.</p>
                <p><b>Exploración interactiva:</b> Ahora el simulador se ha desbloqueado. Arrastra el control deslizante de tiempo o pulsa ▶ PLAY para observar cómo la integral mapea la salida de forma dinámica en tiempo real.</p>
            `;
            break;
            
    }
    
}