/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var simapp = angular.module('SimCtrlApp',[]);

simapp.controller('archCtrl',function archCtrl($scope){
    
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

$scope.add = function(e){
    newparam = $scope.newArchLabel.replace(/\s/g,'');
    $scope.archParams.push({name:newparam,label:$scope.newArchLabel,type:'text'});
    $('#archModel').modal('hide');
    $scope.newArchLabel="";
    $scope.apply();
};

$scope.remove=function(e){
    alert(' Arch remove');
};
    
});


simapp.controller('codesignCtrl',function codesignCtrl($scope){
    
    $scope.codesignParams = [{'name':'mpiRanksNode','label':'MPI Ranks Per Node','type':'text'}
];

$scope.add = function(e){
    alert($scope.newcodesignLabel);
};

$scope.remove=function(e){
    alert('Codesign remove');
};
    
});



simapp.controller('appCtrl',function appCtrl($scope){
    
    $scope.appParams = [{'name':'executionTime','label':'Execution Time(s)','type':'text'},
{'name':'cpuActivity','label':'CPU Activity(1-100)','type':'text'},
{'name':'memActivity','label':'Memory Activity(1-100)','type':'text'}
];
    $scope.add = function(e){
    alert($scope.newAppLabel);
};

$scope.remove=function(e){
    alert('App remove');
};
});

