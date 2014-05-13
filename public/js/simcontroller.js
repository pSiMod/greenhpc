/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var simapp = angular.module('SimCtrlApp', []);

simapp.controller('paramsCtrl', function($scope, $http) {

    $scope.existingMetaProfileOptions = [{'name': 'Topology-Titan'}];

    $scope.analyticsWorkflowOptions = [{'name': 'Topology analytics'}, {'name': 'Simulation, Topology Analytics'}, {'name': 'Simulation, Topo, UQ Analytics'}];

    $scope.dataAnalyticsTypeOptions = [{'name': 'In-situ'}, {'name': 'In-transit'}, {'name': 'Hybrid'}];

    $scope.stagingTypeOptions = [{'name': 'DRAM'}, {'name': 'NVRAM'}, {'name': 'SSD'}, {'name': 'HDD'}];



    $scope.existingWorkflowProfileOptions = "";
    $scope.existingArchProfileOptions = "";
    $scope.existingRuntimeProfileOptions = "";
    $scope.existingAppProfileOptions = "";

    $scope.existingMetaProfile = "";

    $scope.workflowParams = "";
    $scope.archParams = "";

    $scope.runtimeParamsOptions = "";
    $scope.runtimeParams = "";

    $scope.appParamsOptions = "";
    $scope.appParams = "";

    $scope.mpiActivityFile = "";

    $http.get('/sim/getexistingprofiles').success(function(data) {
        $scope.existingMetaProfileOptions = data['existingMetaProfileOptions'];
        $scope.existingMetaProfile = $scope.searchValue($scope.existingMetaProfileOptions, {'name': 'default'});
    }).error(function() {

    });

    $http.get('/sim/getprofile?profile=default').success(function(data) {

        $scope.workflowParams = data["workflowParams"];
        $scope.workflowParams.parameters[0].value = $scope.searchValue($scope.analyticsWorkflowOptions, $scope.workflowParams.parameters[0].value);
        $scope.workflowParams.parameters[1].value = $scope.searchValue($scope.dataAnalyticsTypeOptions, $scope.workflowParams.parameters[1].value);
        $scope.workflowParams.parameters[2].value = $scope.searchValue($scope.stagingTypeOptions, $scope.workflowParams.parameters[2].value);
        $scope.archParams = data["archParams"];
        $scope.runtimeParams = data["runtimeParams"];
        $scope.appParams = data["appParams"];
        $scope.mpiActivityFile = data['mpiActivityFile'];

        $http.get('/sim/getprofile?profile=workflowProfiles').success(function(data) {
            $scope.existingWorkflowProfileOptions = data;
        }).error(function(e) {
            alert('Unable to retrieve the filed in architecture profiles layout');
        });

        $http.get('/sim/getprofile?profile=runtimeProfiles').success(function(data) {
            $scope.existingRuntimeProfileOptions = data;
            $scope.runtimeParamsOptions = $scope.existingRuntimeProfileOptions[$scope.workflowParams.parameters[0].value.name];
        }).error(function(e) {
            alert('Unable to retrieve the filed in runtime profiles layout');
        });

        $http.get('/sim/getprofile?profile=appProfiles').success(function(data) {
            $scope.existingAppProfileOptions = data;
            $scope.appParamsOptions = $scope.existingAppProfileOptions[$scope.workflowParams.parameters[0].value.name];
        }).error(function(e) {
            alert('Unable to retrieve the filed in app profiles layout');
        });


        $http.get('/sim/getprofile?profile=archProfiles').success(function(data) {
            $scope.existingArchProfileOptions = data;
        }).error(function(e) {
            alert('Unable to retrieve the filed in architecture profiles layout');
        });
                $("#simTab a:first").tab('show');
        $("#appTab a:first").tab('show');


    }).error(function(e) {
        alert('Unable to retrieve the fields in default functional layout');
    });

    $scope.updateArchParams = function(link) {
        $scope.archParams = angular.copy(link);
    };
    $scope.updateRuntimeParams = function(link) {
        $scope.runtimeParams = angular.copy(link);
    };
    $scope.updateAppParams = function(link) {
        $scope.appParams = angular.copy(link);
    };
    $scope.updateWorkflowParams = function(link) {
        $scope.workflowParams = angular.copy(link);
        $scope.workflowParams.parameters[0].value = $scope.searchValue($scope.analyticsWorkflowOptions, $scope.workflowParams.parameters[0].value);
        $scope.workflowParams.parameters[1].value = $scope.searchValue($scope.dataAnalyticsTypeOptions, $scope.workflowParams.parameters[1].value);
        $scope.workflowParams.parameters[2].value = $scope.searchValue($scope.stagingTypeOptions, $scope.workflowParams.parameters[2].value);
        $scope.runtimeParamsOptions = $scope.existingRuntimeProfileOptions[$scope.workflowParams.parameters[0].value.name];
        $scope.appParamsOptions = $scope.existingAppProfileOptions[$scope.workflowParams.parameters[0].value.name];
        $scope.runtimeParams = angular.copy($scope.runtimeParamsOptions.default);
        $scope.appParams = angular.copy($scope.appParamsOptions.default);
        $("#simTab a:first").tab('show');
        $("#appTab a:first").tab('show');
    };

    $scope.updateWorkflow = function(param) {

        if (param.name == "AnalyticsWorkflow")
        {
            $scope.runtimeParamsOptions = $scope.existingRuntimeProfileOptions[param.value.name];
            $scope.runtimeParams = angular.copy($scope.runtimeParamsOptions.default);
            $scope.appParamsOptions = $scope.existingAppProfileOptions[param.value.name];
            $scope.appParams = angular.copy($scope.appParamsOptions.default);
            $("#simTab a:first").tab('show');
            $("#appTab a:first").tab('show');
        }
    };

    $scope.searchValue = function(coll, key) {
        len = coll.length;
        for (i = 0; i < len; i++)
            if (coll[i].name == key.name)
                return coll[i];
    };

    $scope.updateProfile = function() {

        var url = "/sim/getprofile?profile=";
        url = url.concat($scope.existingMetaProfile.name);
        $http.get(url).success(function(data) {

            $scope.workflowParams = data["workflowParams"];
 
            $scope.workflowParams.parameters[0].value = $scope.searchValue($scope.analyticsWorkflowOptions, $scope.workflowParams.parameters[0].value);
            $scope.workflowParams.parameters[1].value = $scope.searchValue($scope.dataAnalyticsTypeOptions, $scope.workflowParams.parameters[1].value);
            $scope.workflowParams.parameters[2].value = $scope.searchValue($scope.stagingTypeOptions, $scope.workflowParams.parameters[2].value);
            $scope.archParams = data["archParams"];
            $scope.runtimeParams = data["runtimeParams"];
            $scope.appParams = data["appParams"];
            $scope.mpiActivityFile = data['mpiActivityFile'];
            $(".simulationResult").html("");
            $scope.opmessage = "";
                    $("#simTab a:first").tab('show');
        $("#appTab a:first").tab('show');
        }).error(function(e) {
            alert('Unable to retrieve the fields in default functional layout');
        });
    };

    $scope.newWorkflow = function() {
        $scope.workflowParams.name = $scope.newWorkflowName;
        $scope.existingWorkflowProfileOptions[$scope.newWorkflowName] = $scope.workflowParams;
        var fd = new FormData();
        fd.append("workflowParamProfile", angular.toJson($scope.existingWorkflowProfileOptions));
        $http.post('/sim/save?name=workflowParamProfile',
                fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).success(function(data) {
            $(".simulationResult").html(data);
        }).error(function(e) {
            alert('error');
        });
        $('#newWorkflowModel').modal('hide');
        $scope.newWorkflowName = "";
    };

    $scope.newArch = function() {
        $scope.archParams.name = $scope.newArchName;
        $scope.existingArchProfileOptions[$scope.newArchName] = $scope.archParams;
        var fd = new FormData();
        fd.append("archParamProfile", angular.toJson($scope.existingArchProfileOptions));
        $http.post('/sim/save?name=archParamProfile',
                fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).success(function(data) {
            $(".simulationResult").html(data);
        }).error(function(e) {
            alert('error');
        });
        $('#newArchModel').modal('hide');
        $scope.newArchName = "";
    };
    $scope.newRuntime = function() {
        $scope.runtimeParams.name = $scope.newRuntimeName;
        $scope.runtimeParamsOptions[$scope.newRuntimeName] = $scope.runtimeParams;
        var fd = new FormData();
        fd.append("runtimeParamProfile", angular.toJson($scope.existingRuntimeProfileOptions));
        $http.post('/sim/save?name=runtimeParamProfile',
                fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).success(function(data) {
            $(".simulationResult").html(data);
        }).error(function(e) {
            alert('error');
        });
        $('#newRuntimeModel').modal('hide');
        $scope.newRuntimeName = "";
    };
    $scope.newApp = function() {
        $scope.appParams.name = $scope.newAppName;
        $scope.appParamsOptions[$scope.newAppName] = $scope.appParams;
        var fd = new FormData();
        fd.append("applicationParamProfile", angular.toJson($scope.existingAppProfileOptions));
        $http.post('/sim/save?name=applicationParamProfile',
                fd, {
            withCredentials: true,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        }).success(function(data) {
            $(".simulationResult").html(data);
        }).error(function(e) {
            alert('error');
        });
        $('#newAppModel').modal('hide');
        $scope.newAppName = "";
    };

    $scope.addWorkflowParam = function() {
        newparam = $scope.newWorkflowLabel.replace(/\s/g, '');
        $scope.workflowParams.parameters.push({'name': newparam, 'label': $scope.newWorkflowLabel, 'type': 'text', 'value': "0"});
        $('#workflowModel').modal('hide');
        $scope.newWorkflowLabel = "";
    };

    $scope.removeWorkflowParam = function(param) {
        index = $scope.workflowParams.parameters.indexOf(param);
        $scope.workflowParams.parameters.splice(index, 1);
    };

    $scope.addArchParam = function() {
        newparam = $scope.newArchLabel.replace(/\s/g, '');
        $scope.archParams.parameters.push({'name': newparam, 'label': $scope.newArchLabel, 'type': 'text', 'value': "0"});
        $('#archModel').modal('hide');
        $scope.newArchLabel = "";
    };

    $scope.removeArchParam = function(param) {
        index = $scope.archParams.parameters.indexOf(param);
        $scope.archParams.parameters.splice(index, 1);
    };


    $scope.addRuntimeParam = function() {
        newparam = $scope.newruntimeLabel.replace(/\s/g, '');
        var currentTab = $("ul#simTab li.active").attr('name');
        $scope.runtimeParams[currentTab].parameters.push({'name': currentTab.concat(newparam), 'label': $scope.newruntimeLabel, 'type': 'text', 'value': "0"});
        $('#runtimeModel').modal('hide');
        $scope.newruntimeLabel = "";
    };

    $scope.removeRuntimeParam = function(param) {
        var currentTab = $("ul#simTab li.active").attr('name');
        index = $scope.runtimeParams[currentTab].parameters.indexOf(param);
        $scope.runtimeParams[currentTab].parameters.splice(index, 1);
    };

    $scope.addAppParam = function() {
        newparam = $scope.newAppLabel.replace(/\s/g, '');
        var currentTab = $("ul#appTab li.active").attr('name');
        $scope.appParams[currentTab].parameters.push({'name': currentTab.concat(newparam), 'label': $scope.newAppLabel, 'type': 'text', 'value': "0"});
        $('#appModel').modal('hide');
        $scope.newAppLabel = "";

    };

    $scope.removeAppParam = function(param) {
        var currentTab = $("ul#appTab li.active").attr('name');
        index = $scope.appParams[currentTab].parameters.indexOf(param);
        $scope.appParams[currentTab].parameters.splice(index, 1);
    };

    $scope.simulate = function() {
        var f = document.getElementById('simulationform');
        var fd = new FormData(f);
        fd.append('existingMetaProfile', angular.toJson($scope.existingMetaProfile));
        fd.append('workflowParams', angular.toJson($scope.workflowParams));
        fd.append('archParams', angular.toJson($scope.archParams));
        fd.append('runtimeParams', angular.toJson($scope.runtimeParams));
        fd.append('appParams', angular.toJson($scope.appParams));
        fd.append('mpiActivityFile', $scope.mpiActivityFile);
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
        if ($scope.existingMetaProfile.name == "default") {
            alert('Cannot change the default profile. Use save as to create a new profile')
        }
        else {
            fd.append('existingMetaProfile', angular.toJson($scope.existingMetaProfile));
            fd.append('workflowParams', angular.toJson($scope.workflowParams));
            fd.append('archParams', angular.toJson($scope.archParams));
            fd.append('runtimeParams', angular.toJson($scope.runtimeParams));
            fd.append('appParams', angular.toJson($scope.appParams));
            fd.append('mpiActivityFile', $scope.mpiActivityFile);

            $http.post('/sim/save', fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            }).success(function(data) {
                $scope.opmessage = data;
            }).error(function(e) {
                $scope.opmessage = data;
            });
        }
    };

    $scope.pillStyle = function(temp)
    {
        if (temp)
            return 'active';
    };
    $scope.saveas = function() {
        newparam = $scope.newskeletonName.replace(/\s/g, '');
        if (newparam != "")
        {
            var fd = new FormData();
            fd.append('newMetaProfileName', angular.toJson(newparam));
            fd.append('workflowParams', angular.toJson($scope.workflowParams));
            fd.append('archParams', angular.toJson($scope.archParams));
            fd.append('runtimeParams', angular.toJson($scope.runtimeParams));
            fd.append('appParams', angular.toJson($scope.appParams));
            fd.append('mpiActivityFile', "");
            $http.post('/sim/saveas',
                    fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            }).success(function(data) {
                $scope.opmessage = data;
                $http.get('/sim/getexistingprofiles').success(function(data) {
                    $scope.existingMetaProfileOptions = data['existingMetaProfileOptions'];
                    $scope.existingMetaProfile = $scope.searchValue($scope.existingMetaProfileOptions, {'name': newparam});
                }).error(function() {

                });
            }).error(function(e) {
                $scope.opmessage = "Error while saving";
            });
        }
        else
            alert('Not able to save. Please try again!');

        $('#saveasModel').modal('hide');
        $scope.newskeletonName = "";
    };
});


