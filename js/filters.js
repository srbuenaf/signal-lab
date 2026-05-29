/**
 * Evalúa la forma base de la respuesta al impulso h(tau) sin desplazar.
 * @param {number} tau Tiempo continuo local
 */
function getHBase(tau) {
    // Si es un modo lineal y causal, el sistema no puede reaccionar antes de t = 0
    if (!state.isPeriodicMode && state.isCausal && tau < 0) {
        return 0;
    }

    const w = state.width;

    switch (state.filterType) {
        case 'delta':
            // Impulso ideal simulado mediante una ventana unitaria estrecha
            return (tau >= -1 && tau <= 1) ? 45 : 0;

        case 'rect_f':
            return (!state.isPeriodicMode && state.isCausal)
                ? (tau >= 0 && tau <= w ? 40 : 0)
                : (tau >= -w / 2 && tau <= w / 2 ? 40 : 0);

        case 'deriv':
            // Filtro derivador: genera un impulso positivo y uno negativo
            if (!state.isPeriodicMode && state.isCausal) {
                if (tau >= 0 && tau < w / 2) return 40;
                if (tau >= w / 2 && tau <= w) return -40;
                return 0;
            } else {
                if (tau >= -w / 2 && tau < 0) return 40;
                if (tau >= 0 && tau <= w / 2) return -40;
                return 0;
            }

        case 'per_tri':
            return Math.abs(tau) <= w ? (1 - Math.abs(tau) / w) * 45 : 0;

        case 'exp':
            // Filtro exponencial decreciente (Causal por naturaleza física)
            return (tau >= 0 && tau <= w) ? 45 * Math.exp(-tau / (w / 3)) : 0;

        case 'sinc': {
            if (Math.abs(tau) < 1e-6) return 45;
            
            // k define la frecuencia de corte aparente según el ancho
            const k = (w / 150) * 4;
            const fc = (2 * Math.PI * k) / T;
            return 45 * (Math.sin(tau * fc) / (tau * fc));
        }
    }

    return 0;
}

/**
 * Gestiona el comportamiento del filtro en ventanas periódicas (Circulares)
 */
function getHPeriod(tau) {
    if (!state.isPeriodicMode) {
        return getHBase(tau);
    }

    // Modularización en el dominio del período fundamental T [-T/2, T/2]
    let m = ((tau + T / 2) % T + T) % T - T / 2;

    // Si se exige causalidad dentro del período circular, anulamos la componente negativa
    if (state.isCausal && m < 0) {
        return 0;
    }

    return getHBase(m);
}

/**
 * Aplica la transformación temporal según el operador seleccionado
 * Convolución: h(t - tau)  |  Correlación: h(tau - t)
 */
function getHTrans(tau, t) {
    return state.isConvolution ? getHPeriod(t - tau) : getHPeriod(tau - t);
}

/**
 * Rellena el buffer global del sistema/filtro
 * @param {number} t Desplazamiento temporal del slider
 */
function buildKernelBuffer(t) {
    for (let x = 0; x <= 500; x++) {
        const tau = x - 250;
        kernelBuffer[x] = getHTrans(tau, t);
    }
}