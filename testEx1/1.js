function refrash(srs,output=[]){
    if (output.length==0) output.length = srs.length;
    var max=0;
    for (var i=0;i<output.length;i++){
        if (output[i]>max) max=output[i];
    }
    for (var i=0;i< srs.length;i++){
        if (srs[i] == 0) { output[i] = 0} //сброшен
        if (srs[i] !=0) {
            if ( output[i] == 0 ) output[i] = max++;
        }
    }
    return output;
}