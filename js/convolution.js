
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

function buildSignalBuffer(){

    for(let x=0;x<=500;x++){

        const tau = x - 250;

        signalBuffer[x] = getF(tau);
    }
}

function buildKernelBuffer(t){

    for(let x=0;x<=500;x++){

        const tau = x - 250;

        kernelBuffer[x] =
            getHTrans(tau,t);
    }
}