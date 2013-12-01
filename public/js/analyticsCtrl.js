google.load("visualization", "1", {packages: ["corechart"]});

function drawChart(arraydata) {
    var data = google.visualization.arrayToDataTable(arraydata);
    var options = {
        title: 'Company Performance'
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

simapp.controller('analyticsCtrl', function($scope, $http, $filter) {
    $scope.existingMetaProfileOptions = [{'name': 'Topology-Titan'}];
    $scope.existingMetaProfile = '';
    $scope.arraydata = [
        ['Year', 'Sales', 'Expenses'],
        ['2004', 1000, 400],
        ['2005', 1170, 460],
        ['2006', 660, 1120],
        ['2007', 1030, 540]
    ];

    $http.get('/sim/getexistingprofiles').success(function(data) {
        $scope.existingMetaProfileOptions = data['existingMetaProfileOptions'];
        $scope.existingMetaProfile = $scope.searchValue($scope.existingMetaProfileOptions, {'name': 'default'});
    }).error(function() {

    });

    $scope.searchValue = function(coll, key) {
        len = coll.length;
        for (i = 0; i < len; i++)
            if (coll[i].name == key.name)
                return coll[i];
    };


    $http.get('/sim/getprofile?profile=default').success(function(data) {
        $scope.archParams = data["archParams"];
        $scope.runtimeParams = data["runtimeParams"];
        $scope.appParams = data["appParams"];

    }).error(function(e) {
        alert('Unable to retrieve the fields in default functional layout');
    });

    $scope.updateProfile = function() {

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

    $scope.plotgraph = function() {
        drawChart($scope.arraydata);
    };

});