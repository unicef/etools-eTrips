(function() {
    'use strict';

    angular
        .module('app.settings')
        .config(config);

    function config($stateProvider) {
        $stateProvider
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'app/settings/settings.html',
                        controller: 'Settings',
                        controllerAs: 'vm'
                    }
                }
            });
    }
})();
