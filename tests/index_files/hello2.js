function sequence(srs){
    var output = [];
    //output.length == srs.length;
    var max=0;
    for (var i=0;i<srs.length;i++){
        if (srs[i]>max) max=output[i];
    }
    var min=max;
    var minIndex;
    for (j=0;j<srs.length;j++){
        for (i=0;i<srs.length;i++){
            if(srs[i]==0) continue;
            if (srs[i]<min) {
                min = srs[i];
                minIndex=i;
            }
        }
        output[j] = minIndex;
        srs[minIndex]=0;
    }
    return output;
}

sequence([0,1,2,3]);


