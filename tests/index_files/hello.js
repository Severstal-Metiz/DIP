function refrash(srs,output=[]){ //какой пункт был выбран первым srs = [0,1,0,0] ... [1,1,0,0] ... [1,1,1,0]  output = [0,1,0,0] ... [2,1,0,0] ... [2,1,3,0]
    if (output.length==0) output.length = srs.length;
    var max=0;
    for (var i=0;i<output.length;i++){
        if (output[i]>max) max=output[i];
    }
    for (var i=0;i< srs.length;i++){
        if (srs[i] == 0) { output[i] = 0} //сброшен
        if (srs[i] > 0) {
            if ( output[i] == 0 ) output[i] = ++max;
        }
    }
    return output;
}

function sequence(srss){
    var srs = srss.slice(0);
    var output = [];
    output.length == srs.length;
    var max=0;
    for (var i=0;i<srs.length;i++){
        if (srs[i]>max) max=srs[i];
    }
    //var k=0;
    var min;
    var minIndex;
    var oldminIndex;
    for (j=0;j<srs.length;j++){
    min=max+1;
        for (i=0;i<srs.length;i++){
            if(srs[i]==0) continue;
            if (srs[i]<min) {
                min = srs[i];
                minIndex=i;
            }
        }
        if (oldminIndex == minIndex) continue;
        output[j] = minIndex;
        srs[minIndex]=0;
        oldminIndex = minIndex;
    }
    return output;
}

console.log(sequence([5,0,2,3,1,4]));

B = refrash([0,0,0,0],B)
console.log(B)
var C = new [](B);
sequence(B)
