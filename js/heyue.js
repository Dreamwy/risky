//传入的必须是json的FzInfo对象
//test
//df379379bee36f6542cb9c33eebc9999be622e8d72c32cfc60a963a9e0c971e8
//n1haddC8e3h6DQcuxEKDsiEPmnnKhokQ5jw
//main
//e5fb06a692b0819a826cb82fd4929a7be4e9b086b0fbe14d4eb8ffbba538738f
//n1tRSqhEdViLqtvZ2SyxUWJ5wdkMfPcT3X3
'use strict';
var FzInfo = function(text) {

};
var SampleContract = function () {
    LocalContractStorage.defineProperty(this, "usermap");
};

SampleContract.prototype = {
    init: function () {
    },

    set: function (name, score) {
        // var userads = Blockchain.transaction.from;
        // var obj = JSON.parse(value)
        var fzq = {};
        fzq.name = name;
        fzq.score = score;
        
        this.usermap = fzq;
        // var alldata = this.usermap.get(userads);
        // if(alldata){
        //     // var array = JSON.parse(alldata);
        //     alldata.push(fzq);
        //     // var arr = JSON.stringify(array)
        //     this.usermap.put(userads, alldata);
        // }else{
        //     // var arr = [];
        //     // arr.push("\""+JSON.stringify(fzq)+"\"");
        //     // arr.push(fzq);
        //     // var arrstr = JSON.stringify(arr)
        //     this.usermap.put(userads, fzq);
        // }

    },
    get: function () {
        // var userads = Blockchain.transaction.from;
        // var data = this.usermap.get(userads);
        return this.usermap;
    },

};
module.exports = SampleContract;