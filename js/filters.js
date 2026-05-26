function getHBase(tau){

    if(
        !state.isPeriodicMode &&
        state.isCausal &&
        tau < 0
    ){
        return 0;
    }

    const w = state.width;

    switch(state.filterType){

        case 'delta':

            return (
                tau >= -1 &&
                tau <= 1
            ) ? 45 : 0;

        case 'rect_f':

            return (!state.isPeriodicMode && state.isCausal)
                ? (
                    tau >=0 &&
                    tau <=w
                  ) ? 40 : 0
                : (
                    tau >= -w/2 &&
                    tau <= w/2
                  ) ? 40 : 0;

        case 'deriv':

            return (!state.isPeriodicMode && state.isCausal)

                ? (
                    tau >=0 &&
                    tau < w/2
                  )
                    ? 40
                    : (
                        tau >=w/2 &&
                        tau <=w
                      )
                        ? -40
                        : 0

                : (
                    tau >= -w/2 &&
                    tau < 0
                  )
                    ? 40
                    : (
                        tau >=0 &&
                        tau <=w/2
                      )
                        ? -40
                        : 0;

        case 'per_tri':

            return Math.abs(tau) <= w
                ? (1 - Math.abs(tau)/w) * 45
                : 0;

        case 'exp':

            return (
                tau >=0 &&
                tau <=w
            )
                ? 45 * Math.exp(
                    -tau / (w/3)
                  )
                : 0;

        case 'sinc': {

            if(Math.abs(tau) < 1e-6)
                return 45;

            const k = (w / 150) * 4;

            const fc =
                (2 * Math.PI * k) / T;

            return 45 *
                (
                    Math.sin(tau * fc) /
                    (tau * fc)
                );
        }
    }

    return 0;
}

function getHPeriod(tau){

    if(!state.isPeriodicMode)
        return getHBase(tau);

    let m =
        ((tau + T/2) % T + T) % T - T/2;

    if(state.isCausal && m < 0)
        return 0;

    return getHBase(m);
}

function getHTrans(tau,t){

    return state.isConvolution
        ? getHPeriod(t - tau)
        : getHPeriod(tau - t);
}