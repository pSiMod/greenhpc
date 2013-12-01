/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var simapp = angular.module('SimCtrlApp', []);

simapp.controller('paramsCtrl', function($scope, $http) {

    $scope.existingMetaProfileOptions = [{'name': 'Topology-Titan'}];

    $scope.analyticsWorkflowOptions = [{'name': 'Topology analytics'}];

    $scope.dataAnalyticsTypeOptions = [{'name': 'In-situ'}, {'name': 'In-transit'}, {'name': 'Hybrid'}];
    
    $scope.paneldata = "";
    $scope.existingMetaProfile = "";
    $scope.analyticsWorkflow = "";
    $scope.archParams = "";
    $scope.dataAnalyticsType = "";
    $scope.runtimeParams = "";
    $scope.appParams = "";
    $scope.mpiActivityFile = "";
    
    $http.get('/sim/getexistingprofiles').success(function(data){
        $scope.existingMetaProfileOptions = data['existingMetaProfileOptions'];
        $scope.existingMetaProfile = $scope.searchValue($scope.existingMetaProfileOptions,{'name':'default'});
    }).error(function(){
        
    });

    $http.get('/sim/getprofile?profile=default').success(function(data) {
        $scope.analyticsWorkflow = $scope.searchValue($scope.analyticsWorkflowOptions, data["analyticsWorkflow"]);
        $scope.dataAnalyticsType = $scope.searchValue($scope.dataAnalyticsTypeOptions, data["dataAnalyticsType"]);
        $scope.archParams = data["archParams"];
        $scope.runtimeParams = data["runtimeParams"];
        $scope.appParams = data["appParams"];
        $scope.mpiActivityFile = data['mpiActivityFile'];

    }).error(function(e) {
        alert('Unable to retrieve the fields in default functional layout');
    });

    $scope.searchValue = function(coll, key) {
        len = coll.length;
        for (i = 0; i < len; i++)
            if (coll[i].name == key.name)
                return coll[i];
    };
    
    $scope.updateProfile = function(){
        
        var url = "/sim/getprofile?profile=";
        url = url.concat($scope.existingMetaProfile.name);
        $http.get(url).success(function(data) {
        $scope.analyticsWorkflow = $scope.searchValue($scope.analyticsWorkflowOptions, data["analyticsWorkflow"]);
        $scope.dataAnalyticsType = $scope.searchValue($scope.dataAnalyticsTypeOptions, data["dataAnalyticsType"]);
        $scope.archParams = data["archParams"];
        $scope.runtimeParams = data["runtimeParams"];
        $scope.appParams = data["appParams"];
        $scope.mpiActivityFile = data['mpiActivityFile'];

    }).error(function(e) {
        alert('Unable to retrieve the fields in default functional layout');
    });
    };

    $scope.addArchParam = function() {
        newparam = $scope.newArchLabel.replace(/\s/g, '');
        $scope.archParams.push({'name': newparam, 'label': $scope.newArchLabel, 'type': 'text', 'value': "0"});
        $('#archModel').modal('hide');
        $scope.newArchLabel = "";

    };

    $scope.removeArchParam = function(param) {
        index = $scope.archParams.indexOf(param);
        $scope.archParams.splice(index, 1);
    };

    $scope.addCoDesignParam = function() {
        newparam = $scope.newruntimeLabel.replace(/\s/g, '');
        $scope.runtimeParams.push({'name': newparam, 'label': $scope.newruntimeLabel, 'type': 'text', 'value': "0"});
        $('#runtimeModel').modal('hide');
        $scope.newruntimeLabel = "";

    };

    $scope.removeCoDesignParam = function(param) {
        index = $scope.runtimeParams.indexOf(param);
        $scope.runtimeParams.splice(index, 1);
    };

    $scope.addAppParam = function() {
        newparam = $scope.newAppLabel.replace(/\s/g, '');
        $scope.appParams.push({'name': newparam, 'label': $scope.newAppLabel, 'type': 'text', 'value': "0"});
        $('#appModel').modal('hide');
        $scope.newAppLabel = "";

    };

    $scope.removeAppParam = function(param) {
        index = $scope.appParams.indexOf(param);
        $scope.appParams.splice(index, 1);
    };

    $scope.simulate = function() {
        var f = document.getElementById('simulationform');
        var fd = new FormData(f);
        $http.post('/sim/simulate',
                fd, {
                    withCredentials: true,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).success(function(data) {
            $(".simulationResult").html(data);
        }).error(function(e) {
            alert('error');
        });
    };

    $scope.save = function() {
        
        var fd = new FormData();
        fd.append('existingMetaProfile', angular.toJson($scope.existingMetaProfile));
        fd.append('analyticsWorkflow', angular.toJson($scope.analyticsWorkflow));
        fd.append('dataAnalyticsType', angular.toJson($scope.dataAnalyticsType));
        fd.append('archParams', angular.toJson($scope.archParams));
        fd.append('runtimeParams', angular.toJson($scope.runtimeParams));
        fd.append('appParams', angular.toJson($scope.appParams));
        fd.append('mpiActivityFile', $('#mpiActivityFile').val());
        
        $http.post('/sim/save', fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).success(function(data) {
            $scope.opmessage = data;
        }).error(function(e) {
            $scope.opmessage = data;
        });

    };

    $scope.saveas = function() {
        var f = document.getElementById('simulationform');
        var fd = new FormData(f);
        $http.post('/sim/saveas',
                fd, {
                    withCredentials: true,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).success(function(data) {
            $(".simulationResult").html(data);
        }).error(function(e) {
            alert('error');
        });
    };
});


