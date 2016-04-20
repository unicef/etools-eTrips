(function() {
    'use strict';

    angular
        .module('app.core')
        .service('tripService', tripService);

    function tripService(dataService, localStorageService, myHttpService, apiUrlService) {
        var service = {
            deleteDraft: deleteDraft,
            getAP: getActionPoint,
            getDraft: getDraft,
            getTrip: getTrip,
            localApprove: localApprove,
            localSubmit: localSubmit,            
            localTripUpdate: localTripUpdate,
            reportText: reportText,
            sendAP: sendActionPoint,
            setDraft: setDraft,
            tripAction: tripAction
        };

        return service;

        function deleteDraft(tripId, dataType){
            var country = localStorageService.getObject('currentUser').profile.country;
            var obj = localStorageService.getObject('draft-' + country);

            if (dataType in obj[tripId]) {
                delete obj[tripId][dataType];
                localStorageService.setObject('draft-' + country, obj);
            }
        }

        function getTrip(id){            
            for (var i=0;i<localStorageService.getObject('trips').length;i++) {
                if(localStorageService.getObject('trips')[i].id == id){
                    return localStorageService.getObject('trips')[i];
                }
            }

            return null;
        }

        function getActionPoint(trip, ap_id){
            for (var i=0;i<trip.actionpoint_set.length;i++) {
                if (trip.actionpoint_set[i].id == ap_id) {
                    return formatActionPoint(trip.actionpoint_set[i]);
                }
            }
            
            return null;
        }

        function getDraft(tripId, dtype){
            // if there isn't a currentUser in here we're in big trouble anyway
            var country = localStorageService.getObject('currentUser').profile.country;
            var my_obj = localStorageService.getObject('draft-' + country);

            if (Object.keys(my_obj).length) {
                // check for trip
                if (my_obj[tripId]) {
                    var validDataTypes = ['text', 'notes', 'main_observations', 'constraints', 'lessons_learned', 'opportunities', 'pictures'];

                    for(var i=0; i<validDataTypes.length; i++){
                        if (( validDataTypes[i] === dtype) && (my_obj[tripId][dtype])) {
                            return my_obj[tripId][dtype];
                        }
                    }
                }
            }

            return {};
        }

        function localAction(id, action){
            var currentTrips = localStorageService.getObject('trips');
            for (var i=0;i<currentTrips.length;i++) {
                if (currentTrips[i].id == id) {
                    currentTrips[i].status = action;
                    localStorageService.setObject("trips", currentTrips);
                    return true;
                }
            }
            
            return;
        }

        function localApprove(id) {
            return localAction(id, 'approved');
        }

        function localSubmit(id) {
            return localAction(id, 'submitted');
        }

        function localTripUpdate(id, trip) {
            var currentTrips = localStorageService.getObject('trips');
            for (var i=0; i<currentTrips.length; i++) {
                if (currentTrips[i].id == id) {
                    currentTrips[i] = trip;
                    localStorageService.setObject("trips", currentTrips);
                    return true;
                }
            }

            return false;
        }

        function reportText(data, tripId, success, fail) {
            // if we need any extra data proccessing here would be the place
            dataService.patchTrip(tripId, data, success, fail);
        }

        function sendActionPoint(tripId, ap, success, fail) {
            var actionPoint = formatActionPoint(ap, true);
            var data = { 'actionpoint_set' : [ actionPoint ] };
            dataService.patchTrip(tripId, data, success, fail);
        }

        function setDraft(tripId, dtype, draft) {
            // if there isn't a currentUser in here we're in big trouble anyway
            var country = localStorageService.getObject('currentUser').profile.country;
            var my_obj = localStorageService.getObject('draft-' + country);

            // if there is an object stored
            if (Object.keys(my_obj).length) {
                // if this object has the tripId
                if (my_obj[tripId]) {
                    my_obj[tripId][dtype] = draft;
                } else {
                    my_obj[tripId] = {};
                    my_obj[tripId][dtype] = draft;
                }
            } else {
                my_obj = {};
                my_obj[tripId]={};
                my_obj[tripId][dtype] = draft;
            }

            localStorageService.setObject('draft-' + country, my_obj);
        }

        function tripAction(id, action, data) {
            var url = apiUrlService.BASE() + '/trips/api/' + id + '/';
            var result = myHttpService.post(url + action + '/', data);

            return result;
        }

        function formatActionPoint(ap, for_upload) {
            if (for_upload === true) {
                ap.due_date = ap.due_year+"-"+
                        ap.due_month+"-"+
                        ap.due_day;
                delete ap.due_day;
                delete ap.due_year;
                delete ap.due_month;
                delete ap.person_responsible_name;

            } else {
                ap.person_responsible += "";
                var date_array = ap.due_date.split("-");
                ap.due_year = date_array[0];
                ap.due_day = date_array[2];
                ap.due_month = date_array[1];
            }

            return ap;
        }
    }

})();