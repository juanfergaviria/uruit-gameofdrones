(function() {
  'use strict';

  angular.module('GameOfDrones', ['ui.router', 'ngAnimate'])

    .config([
      '$urlRouterProvider', '$stateProvider', '$httpProvider',
      function($urlRouterProvider, $stateProvider, $httpProvider) {
        /**
         * Routes
         */
        $stateProvider
          .state('form', {
            url: '/form',
            templateUrl: './partials/form.html',
            controller: 'MainController'
          })
          .state('form.start', {
            url: '/start',
            templateUrl: './partials/form-start.html'
          })
          .state('form.round', {
            url: '/round',
            templateUrl: './partials/form-round.html'
          })
          .state('form.winner', {
            url: '/winner',
            templateUrl: './partials/form-winner.html'
          })

          .state('admin', {
            url: '/admin',
            templateUrl: './partials/admin.html',
            controller: 'AdminController'
          })
          .state('admin.movements', {
            url: '/movements',
            templateUrl: './partials/admin-movements.html'
          })
        ;

        $urlRouterProvider.otherwise('/form/start');
      }
    ]);

  /**
   * Controllers
   */
  angular.module('GameOfDrones')
    .controller('MainController', [
      '$scope', '$state', 'GofDService', 'filterFilter',
      function($scope, $state, GofDService, filterFilter) {
        $scope.round = 1;
        $scope.maxRounds = 3;
        $scope.players = [];
        $scope.playerIdx = 0;
        $scope.stats = [];
        $scope.wins = false;

        if($scope.players.length === 0) {
          $state.go('form.start');
        }

        GofDService.getLastGameID().then(function(lastGameID) {
          $scope.gameID = lastGameID.data[0].gameID + 1;
        });
        GofDService.getMovements().then(function(movements) {
          $scope.movements = movements.data;
        });

        $scope.newGame = function() {
          $scope.round = 1;
          $scope.maxRounds = 3;
          $scope.players = [];
          $scope.playerIdx = 0;
          $scope.stats = [];
          $scope.wins = false;
          $state.go('form.start');
        };

        $scope.selectItem = function() {
          if($scope.players.length == 2 &&
            typeof $scope.players[0].name != 'undefined' &&
            typeof $scope.players[1].name != 'undefined') {
              $scope.players[0].stats = [];
              $scope.players[1].stats = [];
              $scope.usersMsg = '';
              $state.go('form.round');
              return true;
          }
          $scope.usersMsg = 'Please enter the names of the players';
          return false;
        };

        $scope.selectMovement = function(movement) {
          $scope.players[$scope.playerIdx].movement = movement;
          if($scope.playerIdx < $scope.players.length -1) {
            $scope.playerIdx++;
            $scope.$broadcast('nextMove');
          } else {
            $state.go('form.winner');
          }
        };

        $scope.nextRound = function() {
          angular.forEach($scope.players, function(player) {
            GofDService.saveRound($scope.gameID, player.name, $scope.round, player.winner).then(function(res) {
            }, function(err) {
              console.log('Error saving game/round info: ' + err);
            });
          });
          setTimeout(function() {
            $scope.calculateStats();
            $scope.round++;
            $scope.playerIdx = 0;
            $state.go('form.round');
          });
        };

        $scope.calculateStats = function() {
          $scope.stats = [];

          for(var j=0; j<$scope.players.length; j++) {
            var player = $scope.players[j];

            if(typeof $scope.players[j].wins == 'undefined') {
              $scope.players[j].wins = 0;
            }

            for(var i=0; i<player.stats.length; i++) {
              var pstats = player.stats[i];
              if(pstats.winner === true) {
                $scope.stats.push({
                  round: pstats.round,
                  player: player.name
                });
              }
            }
          }

          setTimeout(function() {
            angular.forEach($scope.players, function(player) {
              var playerFiltered = filterFilter($scope.stats, {player:player.name});
              player.wins = playerFiltered.length;

              if(player.wins == $scope.maxRounds) {
                $scope.wins = true;
                $scope.$broadcast('player.wins', {name: player.name});
                $state.go('form.winner');
              }
            });
          });
        };
      }
    ])

    .controller('AdminController', [
      '$scope', '$state', 'GofDService', 'filterFilter',
      function($scope, $state, GofDService, filterFilter) {
        $scope.movement = {
          update: false,
          id: null,
          name: null,
          kills: null
        };
        $scope.response = {
          class: null,
          msg: null
        };

        GofDService.getMovements().then(function(movements) {
          $scope.movements = movements.data;
        });

        $scope.saveMovement = function() {
          if($scope.movement.update === true) {
            GofDService.updateMovement($scope.movement.id, $scope.movement.name, $scope.movement.kills).then(function(res) {
              $scope.$broadcast('modal.close');

              console.log('Movement updated!');

              GofDService.getMovements().then(function(movements) {
                $scope.movements = movements.data;
              });
            }, function(err) {
              console.log(err);
            });
          } else {
            GofDService.newMovement($scope.movement).then(function(res) {
              $scope.$broadcast('modal.close');

              console.log('Movement added!');

              GofDService.getMovements().then(function(movements) {
                $scope.movements = movements.data;
              });
            }, function(err) {
              console.log(err);
            });
          }
        };

        $scope.deleteMovement = function(id) {
          GofDService.deleteMovement(id).then(function(res) {
            $scope.$broadcast('modal.close');

            console.log('Movement deleted!');

            GofDService.getMovements().then(function(movements) {
              $scope.movements = movements.data;
            });
          }, function(err) {
            console.log(err);
          });
        };
      }
    ])
  ;

  /**
   * Services
   */
  angular.module('GameOfDrones')
    .service('GofDService', [
      '$http', function($http) {
        var baseUrl = 'http://localhost:1337/';

        return {
          getMovements: function() {
            return $http.get(baseUrl + 'movements');
          },
          updateMovement: function(id, name, kills) {
            return $http.post(baseUrl + 'movements/' + id, {
              name: name,
              kills: kills
            });
          },
          newMovement: function(movement) {
            return $http.post(baseUrl + 'movements', movement);
          },
          deleteMovement: function(id) {
            return $http.delete(baseUrl + 'movements/' + id);
          },
          getLastGameID: function() {
            return $http.get(baseUrl + 'games?sort=gameID DESC&limit=1');
          },
          listRounds: function(gameID, username, winner) {
            winner = winner !== null ? '&winner=' + winner : '';
            return $http.get(
              baseUrl + 'games?' +
              'gameID=' + gameID +
              '&username=' + username +
              winner
            );
          },
          saveRound: function(gameID, username, round, winner) {
            return $http.post(baseUrl + 'games', {
              gameID: gameID,
              username: username,
              round: round,
              winner: winner
            });
          }
        };
      }
    ])
  ;

  /**
   * Directives
   */
  angular.module('GameOfDrones')
    .directive('rounds', [
      function() {
        return {
          link: function(scope, element, attrs) {
            var suffix = ' select your move';

            var changePlayerName = function() {
              $('.playername', element).html(scope.players[scope.playerIdx].name + suffix);
            };

            changePlayerName();
            scope.$on('nextMove', function() {
              changePlayerName();
            });
          }
        };
      }
    ])
    .directive('winner', [
      'filterFilter',
      function(filterFilter) {
        return {
          link: function(scope, element, attrs) {
            if(filterFilter(scope.movements, {name: scope.players[0].movement, kills: scope.players[1].movement}).length > 0) {
              scope.players[0].stats.push({ round: scope.round, winner: true });
              scope.players[1].stats.push({ round: scope.round, winner: false });
              $('.playername', element).html(scope.players[0].name + ' wins Round ' + scope.round);
            } else if(filterFilter(scope.movements, {name: scope.players[1].movement, kills: scope.players[0].movement}).length > 0) {
              scope.players[1].stats.push({ round: scope.round, winner: true });
              scope.players[0].stats.push({ round: scope.round, winner: false });
              $('.playername', element).html(scope.players[1].name + ' wins Round ' + scope.round);
            } else {
              scope.players[0].stats.push({ round: scope.round, winner: false });
              scope.players[1].stats.push({ round: scope.round, winner: false });
              $('.playername', element).html('A draw!');
            }

            scope.$on('player.wins', function(event, args) {
              $('.playername', element).html(args.name + ' wins the game!');
            });
          }
        };
      }
    ])
    .directive('updateMovement', [
      function() {
        return {
          restrict: 'C',
          link: function(scope, element, attrs) {
            $(element).on('show.bs.modal', function(event) {
              var button = $(event.relatedTarget);
              var name = button.data('name');
              var kills = button.data('kills');
              var id = button.data('id');
              var modal = $(this);

              if(typeof id != 'undefined' && id != '') {
                scope.movement.update = true;
              }

              modal.find('.movement-name').val(name);
              modal.find('.movement-kills').val(kills);
              modal.find('.movement-id').val(id);

              scope.movement.name = name;
              scope.movement.kills = kills;
              scope.movement.id = id;
            });

            scope.$on('modal.close', function() {
              $(element).modal('hide');
              scope.movement.update = false;
            });
          }
        };
      }
    ])
  ;
}());