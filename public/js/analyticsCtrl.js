google.load("visualization", "1", {packages: ["corechart"]});

function drawChart(arraydata, plotside) {
    var data = google.visualization.arrayToDataTable(arraydata);
    var options = {
        title: 'Performance',
        hAxis:{title:$('#xaxisparams'.concat(plotside)).val()},
        vAxis:{title:$('#yaxisparams'.concat(plotside)).val()}
    };
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'.concat(plotside)));
    chart.draw(data, options);
}

function drawHighChart(arraydata,plotside)
{
    $('#chart_div'.concat(plotside)).highcharts({
            title: {
                text:null
            },
            
            xAxis: {
                title: {
                    enabled: true,
                    text: $('#xaxisparams'.concat(plotside)).val()
                }
            },
            yAxis: {
                title: {
                    text: $('#yaxisparams'.concat(plotside)).val()
                }
              
            }
           
        ,
              series:arraydata
        });
    
}
var chartdata=[];

simapp.controller('analyticsCtrl', function($scope, $http, $filter) {

    $scope.existingMetaProfileOptions = [{'name': 'Topology-Titan'}];
    $scope.existingMetaProfileLeft = '';
    $scope.existingMetaProfileRight = '';


    $scope.arraydata = [];

    $http.get('/sim/getexistingprofiles').success(function(data) {
        $scope.existingMetaProfileOptions = data['existingMetaProfileOptions'];
        $scope.existingMetaProfileLeft = $scope.searchValue($scope.existingMetaProfileOptions, {'name': 'default'});
        $scope.existingMetaProfileRight = $scope.searchValue($scope.existingMetaProfileOptions, {'name': 'default'});
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
        $scope.mpiActivityFile = data['mpiActivityFile'];
    }).error(function(e) {
        alert('Unable to retrieve the fields in default functional layout');
    });

    $scope.updateProfile = function() {

        var url = "/sim/getprofile?profile=";
        url = url.concat($scope.existingMetaProfile.name);
        $http.get(url).success(function(data) {
            $scope.archParams = data["archParams"];
            $scope.runtimeParams = data["runtimeParams"];
            $scope.appParams = data["appParams"];
            $scope.mpiActivityFile = data['mpiActivityFile'];
        }).error(function(e) {
            alert('Unable to retrieve the fields in default functional layout');
        });
    };
  
    $scope.plotgraph = function(side) {
        $('#chart_div'.concat(side)).html('');
          //$('#loading'.concat(side)).show();
        var fd = new FormData();
        if (side == 'left')
            fd.append('metaProfileName', $scope.existingMetaProfileLeft.name);
        if (side == 'right')
            fd.append('metaProfileName', $scope.existingMetaProfileRight.name);
        fd.append('xaxisparams', $('#xaxisparams'.concat(side)).val());
        fd.append('rangestart', $('#rangestart'.concat(side)).val());
        fd.append('rangeend', $('#rangeend'.concat(side)).val());
        fd.append('rangestep', $('#rangestep'.concat(side)).val());
        fd.append('yaxisparams', $('#yaxisparams'.concat(side)).val());

        /*$http.post('/sim/plot', fd,
                {
                    withCredentials: true,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }
        ).success(function(data) {
              $('#loading'.concat(side)).hide();
            if(data.message !== "")
            {
                alert(data.message);
            }
            else
            {
                $scope.arraydata = [[$('#xaxisparams'.concat(side)).val(),$('#yaxisparams'.concat(side)).val()]];
                for(i=0;i<data.output.length;i++)
                $scope.arraydata.push([parseFloat(data.output[i][0]),parseFloat(data.output[i][1])]);
            }
                drawChart($scope.arraydata, side);
        }).error(function(e) {
              $('#loading'.concat(side)).hide();
            alert('Error!!. Please try again');
        });*/
        if(side == 'left')
            {
        chartdata=[{
            name: 'Chart ' + side,
                data: [[0, 19], [10, -10], [20, -56.5], [30, -26.5], [40, -52.1],
                    [50, -12.5], [60, -2.7], [70, -34.7], [80, -76.5]]
            }];
            }
            else
                {
                    chartdata=[{
            name: 'Chart ' + side,
                data: [[0, 15], [10, -50], [20, -56.5], [30, -46.5], [40, -22.1],
                    [50, -2.5], [60, -27.7], [70, -55.7], [80, -76.5]]
            }];
            }
                            
        drawHighChart(chartdata,side);
        
    };
});