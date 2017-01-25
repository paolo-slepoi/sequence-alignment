(function() {
    var app = angular.module('sequenceAlignmentDemo', []);

    app.config(function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });


    app.controller('mainController', ['$scope', '$location', '$httpParamSerializer', function($scope, $location, $httpParamSerializer) {

        $scope.examples = [{
            sequenceA: 'ACTGAT',
            sequenceB: 'ACGCA',
            match: 2,
            mismatch: -3,
            gap: -2,
            showPaths: false,
            showArrows: false
        }, {
            sequenceA: 'ACTGATTCA',
            sequenceB: 'ACGCATCA',
            match: 2,
            mismatch: -3,
            gap: -2
        }, {
            sequenceA: 'SEND',
            sequenceB: 'AND'
        }, {
            sequenceA: 'GCATGCU',
            sequenceB: 'GATTACA'
        }, {
            sequenceA: 'GCGTA',
            sequenceB: 'TGCAAT'
        }, {
            sequenceA: 'CGTGAATTCAT',
            sequenceB: 'GACTTAC'
        }, {
            sequenceA: 'TGTTACGG',
            sequenceB: 'GGTTGACTA',
            local: true,
            gap: -2,
            match: 3,
            mismatch: -3
        }];


        $scope.sequenceA = $location.search().sequenceA || $scope.examples[0].sequenceA;
        $scope.sequenceB = $location.search().sequenceB || $scope.examples[0].sequenceB;

        // $scope.sequenceA = $location.search().sequenceA || 'SEND';
        // $scope.sequenceB = $location.search().sequenceB || 'AND';

        $scope.gap = $location.search().gap !== undefined ? $location.search().gap : -1;
        $scope.mismatch = $location.search().mismatch !== undefined ? $location.search().mismatch : -1;
        $scope.match = $location.search().match !== undefined ? $location.search().match : 1;
        $scope.local = $location.search().local == 'true';

        $scope.showPaths = $location.search().showPaths !== undefined ? $location.search().showPaths == 'true' : true;
        $scope.showArrows = $location.search().showArrows !== undefined ? $location.search().showArrows == 'true' : true;



        $scope.localOptions = [{
            value: false,
            label: 'GLOBAL'
        }, {
            value: true,
            label: 'LOCAL'
        }];



        //keeping it simple atm
        function scoring(a, b) {
            return (a != b ? $scope.mismatch * 1 : $scope.match * 1); //temp solutions...
        }

        $scope.loadExample = function(e) {
            window.location = window.location.pathname + '?' + $httpParamSerializer(e)
        };

        $scope.clear = function() {
            $scope.matrix = undefined;
            $scope.alignments = undefined;
        }

        $scope.align = function() {
            var x = SequenceAlignemnt.align($scope.sequenceA, $scope.sequenceB, scoring, $scope.gap * 1, $scope.local);
            $scope.matrix = x.matrix;
            $scope.alignments = x.alignments;
        }

        $scope.align();

    }]);



})();
