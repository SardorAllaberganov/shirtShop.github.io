app.controller('measurementController', function($scope, $http) {
  $scope.measure = () =>{
    $http.get("/data/js/shirt-sizes.json").then(function(size_data){
      $scope.size = angular.fromJson(size_data);
      for(let i = 0; i < $scope.size.data.length;i++) {
        // console.log($scope.size.data[i].Id);
        let height = document.getElementById("height").value;
        let weight = document.getElementById("weight").value;
        let collar = document.getElementById("collar").value;
        if((height && weight && collar) != ""){
          if ($scope.size.data[i].height == height && $scope.size.data[i].weight == weight && $scope.size.data[i].collar_size == collar) {
            console.log("neck: " + $scope.size.data[i].neck);
            console.log("chest: " +  $scope.size.data[i].chest);
            console.log("waist: " +  $scope.size.data[i].waist);

            document.getElementById("neck").value = $scope.size.data[i].neck;
            document.getElementById("chest").value = $scope.size.data[i].chest;
            document.getElementById("waist").value = $scope.size.data[i].waist;
            document.getElementById("seat").value = $scope.size.data[i].seat;
            document.getElementById("shirtL").value = $scope.size.data[i].shirt_length;
            document.getElementById("shoulderW").value = $scope.size.data[i].shoulder_width;
            document.getElementById("arm").value = $scope.size.data[i].arm_length;
            document.getElementById("wrist").value = $scope.size.data[i].wrist;
            document.getElementById("hip_bottoms").value = $scope.size.data[i].hip_bottoms;
            document.getElementById("seat_bottom").value = $scope.size.data[i].seat_bottoms;
            document.getElementById("inseam").value = $scope.size.data[i].inseam;
            document.getElementById("hip").value = $scope.size.data[i].hip;
            
          }   
          else if(($scope.size.data[i].height == height || $scope.size.data[i].height == height-1) && ($scope.size.data[i].weight == (weight - 1) || $scope.size.data[i].weight == weight) && $scope.size.data[i].collar_size == collar){
            document.getElementById("neck").value = $scope.size.data[i].neck;
            document.getElementById("chest").value = $scope.size.data[i].chest;
            document.getElementById("waist").value = $scope.size.data[i].waist;
            document.getElementById("seat").value = $scope.size.data[i].seat;
            document.getElementById("shirtL").value = $scope.size.data[i].shirt_length;
            document.getElementById("shoulderW").value = $scope.size.data[i].shoulder_width;
            document.getElementById("arm").value = $scope.size.data[i].arm_length;
            document.getElementById("wrist").value = $scope.size.data[i].wrist;
            document.getElementById("hip_bottoms").value = $scope.size.data[i].hip_bottoms;
            document.getElementById("seat_bottom").value = $scope.size.data[i].seat_bottoms;
            document.getElementById("inseam").value = $scope.size.data[i].inseam;
            document.getElementById("hip").value = $scope.size.data[i].hip;
            console.log("second");
          }
          else if(($scope.size.data[i].height == height || $scope.size.data[i].height == height - 1) && $scope.size.data[i].weight - 1 == weight && $scope.size.data[i].collar_size == collar){
            document.getElementById("neck").value = $scope.size.data[i].neck;
            document.getElementById("chest").value = $scope.size.data[i-1].chest;
            document.getElementById("waist").value = $scope.size.data[i-1].waist;
            document.getElementById("seat").value = $scope.size.data[i-1].seat;
            document.getElementById("shirtL").value = $scope.size.data[i].shirt_length;
            document.getElementById("shoulderW").value = $scope.size.data[i-1].shoulder_width;
            document.getElementById("arm").value = $scope.size.data[i].arm_length;
            document.getElementById("wrist").value = $scope.size.data[i-1].wrist;
            document.getElementById("hip_bottoms").value = $scope.size.data[i].hip_bottoms;
            document.getElementById("seat_bottom").value = $scope.size.data[i].seat_bottoms;
            document.getElementById("inseam").value = $scope.size.data[i].inseam;
            document.getElementById("hip").value = $scope.size.data[i].hip;
            console.log("third");
          }
          var test1 = $('#dialog_measure_sizes > input').val();
          if (test1 !== "") {
            $('#dialog_measure_sizes').modal('hide');
          }
          $scope.setStyle={borderColor:'#333'};
        }
        else{
          $scope.setStyle={borderColor:'red'};
          // let warningLog = document.getElementById("warningLog");
          // warningLog.style.display = "block";
          // setTimeout(function(){
          //   warningLog.style.display = "none"; 
          // }, 1500);
          // document.getElementById("measure-btn").removeAttribute("data-dismiss");
          var test1 = $('#dialog_measure_sizes > input').val();
          if (test1 === "") {
            $('#\\#dialog_measure_sizes').modal('show');
          }
          console.log("empty input");
          break;
        }
      }
    });
  }
  
});