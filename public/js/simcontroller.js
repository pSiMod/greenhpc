/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var simapp = angular.module('SimCtrlApp',[]);

simapp.controller('paramsCtrl',function archCtrl($scope){
    
    $scope.archParams = [{'name':'numberOfCores','label':'CPU Cores','type':'text'},
{'name':'coresPerNode','label':'Cores per Node','type':'text'},
{'name':'cpuIdlePower','label':'CPU Idle power','type':'text'},
{'name':'cpuActivePower','label':'CPU Active Power','type':'text'},
{'name':'memIdlePower','label':'Memory Idle Power','type':'text'},
{'name':'memActivePower','label':'Memory Active Power','type':'text'},
{'name':'nicIdlePower','label':'NIC Idle Power','type':'text'},
{'name':'nicActivePower','label':'NIC Active Power','type':'text'},
{'name':'miscActive Power','label':'Misc Active Power','type':'text'}
];

    $scope.codesignParams = [{'name':'mpiRanksNode','label':'MPI Ranks Per Node','type':'text'}
];

    $scope.appParams = [{'name':'executionTime','label':'Execution Time(s)','type':'text'},
{'name':'cpuActivity','label':'CPU Activity(1-100)','type':'text'},
{'name':'memActivity','label':'Memory Activity(1-100)','type':'text'}

];
//{'name':'faninn','label':'Fan In','type':'text'}


$scope.addArchParam = function(){
    newparam = $scope.newArchLabel.replace(/\s/g,'');
    $scope.archParams.push({name:newparam,label:$scope.newArchLabel,type:'text'});
    $('#archModel').modal('hide');
    $scope.newArchLabel="";

};

$scope.removeArchParam =function(param){
    index = $scope.archParams.indexOf(param);
    $scope.archParams.splice(index,1);
};

$scope.addCoDesignParam = function(){
    newparam = $scope.newcodesignLabel.replace(/\s/g,'');
    $scope.codesignParams.push({name:newparam,label:$scope.newcodesignLabel,type:'text'});
    $('#codesignModel').modal('hide');
    $scope.newcodesignLabel="";

};

$scope.removeCoDesignParam =function(param){
    index = $scope.codesignParams.indexOf(param);
    $scope.codesignParams.splice(index,1);
};

$scope.addAppParam = function(){
    newparam = $scope.newAppLabel.replace(/\s/g,'');
    $scope.appParams.push({name:newparam,label:$scope.newAppLabel,type:'text'});
    $('#appModel').modal('hide');
    $scope.newAppLabel="";

};

$scope.removeAppParam =function(param){
    index = $scope.appParams.indexOf(param);
    $scope.appParams.splice(index,1);
};
});