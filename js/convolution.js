/**
 * Calcula la curva de respuesta completa (Convolución o Correlación)
 * Optimizada para evitar recolocaciones de memoria concurrentes.
 */
function computeResponseCurve() {
    const scan = [];
    let maxAbs = 0;
    const dt = 2;

    // Rellenamos el búfer estático de la señal una única vez antes del bucle
    buildSignalBuffer();

    for (let x = 0; x <= 500; x += 4) {
        let sum = 0;
        const tVal = x - 250;

        // Reconstruye el kernel desplazado para el tiempo 'tVal'
        buildKernelBuffer(tVal);

        let tauStart = !state.isPeriodicMode ? -250 : -T / 2;
        let tauEnd = !state.isPeriodicMode ? 250 : T / 2;

        // Convertimos los límites de tiempo continuo a índices del array
        const idxStart = Math.round(tauStart + 250);
        const idxEnd = Math.round(tauEnd + 250);

        // Optimizamos la regla del trapecio reduciendo validaciones 'if' internas
        let prevProduct = 0;
        let isFirst = true;

        for (let idx = idxStart; idx <= idxEnd; idx += dt) {
            // Control de desbordamiento de búfer seguro
            if (idx < 0 || idx > 500) continue;

            const currentProduct = signalBuffer[idx] * kernelBuffer[idx];

            if (!isFirst) {
                // Regla del trapecio: ((f(x_i-1) + f(x_i)) / 2) * dt
                sum += ((prevProduct + currentProduct) * 0.5) * dt;
            }

            prevProduct = currentProduct;
            isFirst = false;
        }

        // Normalización matemática limpia según el modo integral
        if (!state.isPeriodicMode) {
            sum /= 1000; // Factor de escala para integral lineal global
        } else {
            sum = (sum / T) / 25; // Normalización del período fundamental T
        }

        scan.push({ x, val: sum });
        maxAbs = Math.max(maxAbs, Math.abs(sum));
    }

    return { scan, maxAbs };
}

/**
 * Genera los strings de rutas SVG ('d') para el renderizado del dashboard.
 * @param {number} t Desplazamiento temporal actual
 */
function computeSignalPaths(t) {
    buildSignalBuffer();
    buildKernelBuffer(t);

    let dOverlayH = "M0 0";
    let dF = "M0 0";
    let dH = "M0 0";
    let dHF = "M0 0";
    let dP = "M0 0";
    let dOF = "M0 0";

    // Factor de escala unificado para las vistas superpuestas (Overlay)
    const OVERLAY_SCALE = 4.5;
    const PRODUCT_SCALE = 45;

    for (let x = 0; x <= 500; x += 2) {
        const tau = x - 250;

        const vF = signalBuffer[x];
        const vH = kernelBuffer[x];

        // Determina si se dibuja invertido (Convolución) o idéntico (Correlación)
        const vHF = state.isConvolution ? getHPeriod(-tau) : getHPeriod(tau);
        const vP = (vF * vH) / PRODUCT_SCALE;

        // Construcción síncrona de las cadenas SVG line-to
        dF += ` L${x} ${-vF}`;
        dH += ` L${x} ${-vH}`;
        dHF += ` L${x} ${-vHF}`;
        dP += ` L${x} ${-vP}`;
        dOverlayH += ` L${x} ${-vH * OVERLAY_SCALE}`;
        dOF += ` L${x} ${-(vF * OVERLAY_SCALE)}`;
    }

    return {
        dF,
        dH,
        dHF,
        dP,
        dOverlayH,
        dOF,
        dBase: buildBaseKernelPath()
    };
}

/**
 * Construye la forma base sin desplazar del filtro h(tau)
 */
function buildBaseKernelPath() {
    let d = "M0 0";

    for (let x = 0; x <= 500; x += 2) {
        const tau = x - 250;
        const v = getHPeriod(tau);
        d += ` L${x} ${-v}`;
    }

    return d;
}