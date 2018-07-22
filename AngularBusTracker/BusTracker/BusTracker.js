/**
* Elizabeth Orwig --- JQuery Edition available in the commented out code on the bottom
*/

var myApp = angular.module('myApp', ['ui.bootstrap']);

// Note that the $http service is being passed in to the controller function in this case
myApp.controller('busController', function ($scope, $http, $interval ) {
    $scope.tableshow = false;

	var showTable = false;
	var timer = null;
	var counter = 0;
	var markers = [];
	//$scope.update = update;
    var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(43.044240, -87.906446),
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'styled_map', 'styled_map2']
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    function doAjaxRequest() {
        $scope.tableshow = true;
    	counter++;
		var a = $scope.routeNumber;
        $scope.update = counter;
        var keyVal = "zvkrRC3pJVY9Jn45ibLWQeJWy";

        var vehicles = null;
        //let params = new HttpParams().set("rt",a).set("paramName2", paramValue2);
        // for documentation on $http, see https://docs.angularjs.org/api/ng/service/$http
        $http({
            method: "GET",
            url: "http://sapphire.msoe.edu:8080/BusTrackerProxy/BusInfo",
            params: {"rt":a, "key":keyVal} // we can also add params if needed: params eg: {"rt":31, "key":abcde123}
        }).then(function handleSuccess(responseAjax) {
        	let tester = responseAjax.data["bustime-response"];
        	let results = responseAjax.data;
        	if(tester === undefined){
        		handleFirstError(results);
			} else{
        		let busses = tester.vehicle;
        		if(busses !== undefined){
                    vehicles = responseAjax.data["bustime-response"].vehicle;
                    $scope.table1 = responseAjax.data["bustime-response"].vehicle;
                    callIt($scope, "null");
                    updateMap(vehicles);
				} else{
        			//let error = busses['error'];
					callIt($scope, tester.error[0].msg);
        			//alert("Invalid API Key or route supplied");
        			clearInterval(timer);
        			timer = null;
        			$scope.update = 0;
				}
			}

			//console.log(response.data["bustime-response"].vehicle[0].vid);
        }, function myError(jqXHR, textStatus, errorThrown, responseAjax) {
        	counter = 0;
            handleError(jqXHR, textStatus, errorThrown, responseAjax);
        });
    }

    function updateMap(vehicles){
    	vehicles.forEach(function (entry){
    		var position = new google.maps.LatLng(entry.lat, entry.lon);
    		addMarker(position, entry.vid, entry.des);
		});
	}

    function addMarker(position, title, content) {
			var markerOptions = {
				position: position, // position of the push-pin
				map: map,	// the map to put the pin into
				title: title, // title of the pin
				clickable: true // if true, enable info window pop-up
			};
			// create the push-pin marker
			var marker = new google.maps.Marker(markerOptions);
			markers.push(marker);
			// now create the pop-up window that is displayed when you click the marker
			var infoWindowOptions = {
				content: content, // description
				position: position // where to put it
			};
			var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
			google.maps.event.addListener(marker, "click", function() {
				infoWindow.open(map);
			});
		} // end inner function addMarker

	$scope.init = function(){
    	$scope.update = 0;
    	startLoop();
    	doAjaxRequest();
	};

	function startLoop() {
		callIt($scope, "null");
		timer = $interval(function (){ doAjaxRequest()}, 5000)
	}

	$scope.stopTimer = function(){
		clearInterval(timer);
		$interval.cancel(timer);
        markers.forEach(function (marker){
        	marker.setMap(null);
		});
        $scope.update = 0;
        counter = 0;
	};

	function handleFirstError(results){
		$scope.stopTimer();
        let status = results.status;
        callIt($scope, status);
        clearInterval(timer);
        timer = null;
        $scope.update = 0;
	}

    function handleError(responseAjax) {
		var message = responseAjax.status + " " + responseAjax.statusText;
		callIt($scope,message);
		$scope.update = 0;
		$scope.stopTimer();
			// you may need to create additional Html elements to display the error
	} // end inner function handerError

	function callIt($scope, message){
		if(message === "null"){
			$scope.data = {
				show: false,
				hide: true
			};
		} else {
			$scope.errorMessage = message;
            //document.getElementById("errorMessage").innerText = message;
            $scope.data = {
                show: true,
				hide: false
            };
            $scope.tableshow = false;
            $scope.stopTimer();
        }
	}
});




//class BusTracker {
//	constructor() {
//		var self = this;
//		var isHidden = false;
//		$(document).ready(function() {      // when document loads, do some initialization
//			self.onload(isHidden);
//		});
//	}// end constructor
//
//	// The onLoad member function is called when the document loads and is used to perform initialization.
//	onload() {
//		// Note: these local vars will be visible/accessible within inner functions below!
//		var map = null;	        // a Google Map object
//		var timer = null;       // an interval timer
//		var update = 0;         // an update counter
//		var markers = [];
//
//		var startPosition = new google.maps.LatLng(43.044240, -87.906446);// location of MSOE athletic field
//		createMap(startPosition); // map this starting location (see code below) using Google Maps
//		addMarker(startPosition, "MSOE", "The place to be!");  // add a push-pin to the map
//
//		// initialize button event handlers (note this shows an alternative to $("#id).click(handleClick)
//		$("#start").on( "click", doAjaxRequest);
//		$('#stop').on( "click", stopTimer);
//
//
////NOTE: Remaining helper functions are all inner functions of onLoad; thus, they have
//// access to all vars declared within onLoad.
//
//		// Create a Google Map centered on the specified position. If the map already exists, update the center point of the map per the specified position
//		// param position - a google.maps.LatLng object containing the coordinates to center the map around
//		function createMap(position) {
//			var mapOptions = {
//				zoom: 13, // range 0 to 21 (the mouse can be used to zoom in and out)
//				center: position, // the position at the center of the map
//				mapTypeId: google.maps.MapTypeId.ROADMAP // ROADMAP, SATELLITE, or HYBRID
//			};
//			var mapDiv = $("#map").get(0); // get the DOM <div> element underlying the jQuery result
//			map = new google.maps.Map(mapDiv, mapOptions); // create the google map
//			map.panTo(position); // pan the map to the specified position
//		}
//
//		// This function adds a "push-pin" marker to the existing map
//		// param map - the map to add the marker to
//		// param position - the google.maps.LatLng position of the marker on the map
//		// param title - the title of the marker
//		// param content - the text that appears when a user clicks on the marker
//		function addMarker(position, title, content) {
//			var markerOptions = {
//				position: position, // position of the push-pin
//				map: map,	// the map to put the pin into
//				title: title, // title of the pin
//				clickable: true // if true, enable info window pop-up
//			};
//			// create the push-pin marker
//			var marker = new google.maps.Marker(markerOptions);
//
//			// now create the pop-up window that is displayed when you click the marker
//			var infoWindowOptions = {
//				content: content, // description
//				position: position // where to put it
//			};
//			var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
//			google.maps.event.addListener(marker, "click", function() {
//				infoWindow.open(map);
//			});
//		} // end inner function addMarker
//
//		function addPictureMarker(position, title, content){
//			var busMarker = "NewBus.png";
//			var marker = new google.maps.Marker({
//				position: position,
//				icon: busMarker,
//				map: map,
//				title: title,
//				clickable: true
//			});
//			var infoWindowOptions = {
//				content: content, // description
//				position: position // where to put it
//			};
//			var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
//            google.maps.event.addListener(marker, "click", function() {
//                infoWindow.open(map);
//            });
//			markers.push(busMarker);
//		}
//
//		//function clearMarkers(){
//		//	markers.forEach(function (marker){
//		//		marker.setMap(null);
//		//		marker = null;
//		//	});
//		//}
//
//
//		// This function executes a JSON request to the CPULoadServlet
//		var counter = 0;
//		function doAjaxRequest() {
//			var params = "key="+$("#route").val(); // append your key and route
//			$.ajax({
//				url : "http://sapphire.msoe.edu:8080/BusTrackerProxy/BusInfo", // the url of the servlet returning the Ajax response
//				data : params,
//				// params, // key and route, for example ""
//				async: true,
//				dataType: "json",
//				crossDomain: true,
//				success: handleSuccess,
//				error: handleError
//			}); //Completing the ajax call by supplying the other necessary call properties
//
//			// start an interval timer only if one has not already been started (to avoid duplicates)
//			// When started, it should cause doAjaxRequest to be called every 5 seconds
//            if (timer === null) {
//            	timer = setInterval(doAjaxRequest, 5000);
//            }
//            $("#update").text("Number of Updates: "+counter);
//		}// end inner function doAjaxRequest
//
//		// This function stops the timer and nulls the reference
//		function stopTimer() {
//			clearInterval(timer);
//			timer = null;
//			counter = 0;
//			$("#table1").hide();
//            $("#update").text("Number of Updates: "+counter);
//		}// end inner function stopTimer
//
//		// This function is called if the Ajax request succeeds.
//		// The response from the server is a JavaScript object!
//		// Note that the Ajax request can succeed, but the response may indicate an error (e.g. if a bad route was specified)
//		function handleSuccess( response, textStatus, jqXHR) {
//			$("#table1").show();
//			var innerhtml = "<tbody><tr><th class='text-center'>Bus</th><th class='text-center'>Route</th><th class='text-center'>latitude</th><th class='text-center'>longitude</th><th class='text-center'>speed(MPH)</th><th class='text-center'>dist(mi)</th></tr>";
//			//Check to ensure that the response does not indicate an error such as a bad route number, missing key, or invalid key!
//			var latitude;
//			var longitude;
//			//Otherwise, iterate through the response to create the table and markers for the map
//			var results = [];
//			var check = "";
//			var bool = true;
//			try {
//                results = response["bustime-response"].vehicle;
//                if(results === undefined){
//                    results = response["bustime-response"].error;
//                    $.each(results, function(index, value){
//                        check = (value.msg);
//                        bool = false;
//                    });
//                    $("#table1").hide();
//                    stopTimer();
//                	throw new Error;
//				}
//                counter++;
//                $.each(results, function(index, value) {
//                    innerhtml += "<tr><td class='text-center'>"
//                        + value.vid
//                        + "</td><td class='text-center'>"
//                        + value.des
//                        + "</td><td class='text-center'>"
//                        + value.lat
//                        + "</td><td class='text-center'>"
//                        + value.lon
//                        + "</td><td class='text-center'>"
//                        + value.spd
//                        + "</td><td class='text-center'>" +
//						(value.pdist*0.00018939) +
//                        "<td></td>";
//                    // Get the latitude and longitude of each bus
//                    latitude = value.lat;
//                    longitude = value.lon;
//                    //Add a marker to the map representing the updated position of each bus, along with information about the bus
//                    var position = new google.maps.LatLng(latitude, longitude); // creates a Google position object
//                    addPictureMarker(position, value.vid, value.des);
//                });
//                innerhtml += "</tbody>";
//                $("#table1").html(innerhtml);
//            } catch(err){
//				if(!bool) {
//                    alert(check);
//                } else{
//					alert(response["status"]);
//				}
//				stopTimer();
//			}
//		}// end inner function handleSuccess
//
//		// This function is called if the Ajax request fails (e.g. network error, bad url, server timeout, etc)
//		function handleError(jqXHR, textStatus, errorThrown) {
//			$("#table1").hide();
//			if(errorThrown === "Not Found"){
//				alert("Resource for request cannot be found.");
//			} else if(errorThrown === ""){
//
//			} else {
//                alert("Unhandled Exception");
//            }
//            stopTimer();
//			// you may need to create additional Html elements to display the error
//		} // end inner function handerError
//
//	} // end onLoad member method
//
//} // end class BusTracker
//