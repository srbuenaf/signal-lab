const RUIDO_BUFFER = Array.from(
    {length:501},
    () => (Math.random() - 0.5) * 70
);

function getF(tau){

    const f = state.freq;

    switch(state.signalType){

        case 'cos':

            return 35 *
                Math.cos(
                    (tau * f * 2 * Math.PI) / T
                );

        case 'rect':

            return (
                tau >= -40 &&
                tau <= 40
            ) ? 45 : 0;

        case 'bipolar':

            return (tau >= -40 && tau < 0)
                ? 35
                : (tau >=0 && tau <=40)
                    ? -35
                    : 0;

        case 'escalon':

            return tau >=0 ? 40 : 0;

        case 'sierra': {

            let m =
                ((tau % T) + T) % T;

            return ((m / T) - .5) * 60;
        }

        case 'ruido': {

            let idx =
                Math.floor(tau + 250);

            return (
                idx >=0 &&
                idx <=500
            )
                ? RUIDO_BUFFER[idx]
                : 0;
        }
    }

    return 0;
}

function buildSignalBuffer(){

    for(let x=0;x<=500;x++){

        const tau = x - 250;

        signalBuffer[x] = getF(tau);
    }
}
