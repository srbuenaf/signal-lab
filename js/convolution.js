function computeResponseCurve(){

    let scan = [];
    let maxAbs = 0;

    const dt = 2;

    buildSignalBuffer();

    for(let x=0;x<=500;x+=4){

        let sum = 0;

        const tVal = x - 250;

        buildKernelBuffer(tVal);

        let tauStart;
        let tauEnd;

        if(!state.isPeriodicMode){

            tauStart = -250;
            tauEnd = 250;

        }else{

            tauStart =- T/2;
            tauEnd = T/2;
        }

        let first = true;
        let prev = 0;

        for(let tau=tauStart;tau<=tauEnd;tau+=dt){

            const idx =
                Math.round(tau + 250);

            if(idx <0 || idx >500)
                continue;

            const current =
                signalBuffer[idx] *
                kernelBuffer[idx];

            if(!first){

                sum +=
                    ((prev + current)/2) * dt;
            }

            prev = current;
            first = false;
        }

        if(!state.isPeriodicMode){

            sum /= 1000;

        }else{

            sum = (sum / T) / 25;
        }

        scan.push({
            x,
            val: sum
        });

        maxAbs = Math.max(
            maxAbs,
            Math.abs(sum)
        );
    }

    return {
        scan,
        maxAbs
    };
}

function computeSignalPaths(t){

    buildSignalBuffer();
    buildKernelBuffer(t);

    let dOverlayH = "M0 0";
    let dF = "M0 0";
    let dH = "M0 0";
    let dHF = "M0 0";
    let dP = "M0 0";
    let dOF = "M0 0";

    for(let x=0;x<=500;x+=2){

        const tau = x - 250;

        const vF = signalBuffer[x];
        const vH = kernelBuffer[x];

        const vHF =
            state.isConvolution
                ? getHPeriod(-tau)
                : getHPeriod(tau);

        const vP =
            (vF * vH) / 45;

        dF += ` L${x} ${-vF}`;
        dH += ` L${x} ${-vH}`;
        dHF += ` L${x} ${-vHF}`;
        dP += ` L${x} ${-vP}`;
        dOverlayH += ` L${x} ${-vH * 4.5}`;
        dOF += ` L${x} ${-(vF*4.5)}`;
    }

    return {

        dF,
        dH,
        dHF,
        dP,
        dOverlayH,
        dOF,

        dBase:
            buildBaseKernelPath()
    };
}

function buildBaseKernelPath(){

    let d = "M0 0";

    for(let x=0;x<=500;x+=2){

        const tau = x - 250;

        const v = getHPeriod(tau);

        d += ` L${x} ${-v}`;
    }

    return d;
}

