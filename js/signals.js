// Buffer estático para el ruido blanco
const RUIDO_BUFFER = Array.from(
    { length: 501 },
    () => (Math.random() - 0.5) * 70
);

/**
 * Evalúa la señal matemática de entrada f(tau) de forma puramente lineal.
 * La señal NO cambia aunque el operador cambie a Convolución Circular.
 * @param {number} tau Tiempo continuo local (-250 a 250)
 */
function getF(tau) {
    const f = state.freq;

    switch (state.signalType) {
        case 'cos':
            return 35 * Math.cos((tau * f * 2 * Math.PI) / T);

        case 'rect':
            return (tau >= -40 && tau <= 40) ? 45 : 0;

        case 'bipolar':
            if (tau >= -40 && tau < 0) return 35;
            if (tau >= 0 && tau <= 40) return -35;
            return 0;

        case 'escalon':
            return tau >= 0 ? 40 : 0;

        case 'sierra': {
            // El diente de sierra mantiene su propia periodicidad interna por naturaleza de la onda,
            // pero de forma independiente al modo del operador.
            let m = ((tau % T) + T) % T;
            return ((m / T) - 0.5) * 60;
        }

        case 'ruido': {
            let idx = Math.floor(tau + 250);
            return (idx >= 0 && idx <= 500) ? RUIDO_BUFFER[idx] : 0;
        }
    }

    return 0;
}

/**
 * Rellena el buffer global de la señal
 */
function buildSignalBuffer() {
    for (let x = 0; x <= 500; x++) {
        const tau = x - 250;
        signalBuffer[x] = getF(tau);
    }
}