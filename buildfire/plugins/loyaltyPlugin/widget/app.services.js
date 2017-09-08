'use strict';

(function (angular, buildfire) {
  angular.module('loyaltyPluginWidget')
    .provider('Buildfire', [function () {
      var Buildfire = this;
      Buildfire.$get = function () {
        return buildfire
      };
      return Buildfire;
    }])
    .factory('Location', [function () {
      var _location = window.location;
      return {
        goTo: function (path) {
          _location.href = path;
        }
      };
    }])
    .factory('ViewStack', ['$rootScope', function ($rootScope) {
      var views = [];
      var viewMap = {};
      return {
        push: function (view) {
          if (viewMap[view.template]) {
            this.pop();
          } else {
            viewMap[view.template] = 1;
            views.push(view);
            $rootScope.$broadcast('VIEW_CHANGED', 'PUSH', view);
          }
          return view;
        },
        pop: function () {
          $rootScope.$broadcast('BEFORE_POP', views[views.length - 1]);
          var view = views.pop();
          delete viewMap[view.template];
          $rootScope.$broadcast('VIEW_CHANGED', 'POP', view);

          return view;
        },
        hasViews: function () {
          return !!views.length;
        },
        getPreviousView: function () {
          return views.length && views[views.length - 2] || {};
        },
        getCurrentView: function () {
          return views.length && views[views.length - 1] || {};
        },
        popAllViews: function (noAnimation) {
          $rootScope.$broadcast('BEFORE_POP', null);
          $rootScope.$broadcast('VIEW_CHANGED', 'POPALL', views, noAnimation);
          views = [];
          viewMap = {};
        }
      };
    }])
    .factory('LoyaltyAPI', ['$q', 'STATUS_CODE', 'STATUS_MESSAGES', 'SERVER', '$http',
      function ($q, STATUS_CODE, STATUS_MESSAGES, SERVER, $http) {
        var getProxyServerUrl = function () {
          return SERVER.URL;
        };
        var addApplication = function (app) {
          var deferred = $q.defer();
          if (!app) {
            deferred.reject(new Error('Undefined app data'));
          }
          $http.post(getProxyServerUrl() + '/api/loyaltyApp', app).success(function (response) {
            if (response.statusCode == 200)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var getApplication = function (id) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined app id'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyApp/' + id).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var getRewards = function (id) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined app id'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyRewards/' + id).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var getLoyaltyPoints = function (userId, userToken, loyaltyUnqiueId) {
          var deferred = $q.defer();
          if (!userId) {
            deferred.reject(new Error('Undefined user Id'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyUser/' + userId + '?userToken=' + encodeURIComponent(userToken) + '&loyaltyUnqiueId=' + loyaltyUnqiueId).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var addLoyaltyPoints = function (userId, userToken, loyaltyUnqiueId, passcode, amount) {
          var deferred = $q.defer();
          if (!loyaltyUnqiueId) {
            deferred.reject(new Error('Undefined application'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyUserAddPoint/' + userId + '?userToken=' + encodeURIComponent(userToken) + '&loyaltyUnqiueId=' + loyaltyUnqiueId + '&redemptionPasscode=' + passcode + '&purchaseAmount=' + amount)
            .success(function (response) {
              if (response)
                deferred.resolve(response);
              else
                deferred.resolve(null);
            })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var validatePasscode = function (userToken, loyaltyUnqiueId, passcode) {
          var deferred = $q.defer();
          if (!loyaltyUnqiueId) {
            deferred.reject(new Error('Undefined application'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyAppPassCode/' + loyaltyUnqiueId + '?userToken=' + encodeURIComponent(userToken) + '&redemptionPasscode=' + passcode)
            .success(function (response) {
              if (response)
                deferred.resolve(response);
              else
                deferred.resolve(null);
            })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var redeemPoints = function (userId, userToken, loyaltyUnqiueId, rewardId) {
          var deferred = $q.defer();
          if (!userToken) {
            deferred.reject(new Error('Undefined user'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyUserRedeem/' + userId + '?loyaltyUnqiueId=' + loyaltyUnqiueId + '&userToken=' + encodeURIComponent(userToken) + '&redeemId=' + rewardId)
            .success(function (response) {
              if (response)
                deferred.resolve(response);
              else
                deferred.resolve(null);
            })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };


        return {
          addApplication: addApplication,
          getApplication: getApplication,
          getRewards: getRewards,
          getLoyaltyPoints: getLoyaltyPoints,
          addLoyaltyPoints: addLoyaltyPoints,
          validatePasscode: validatePasscode,
          redeemPoints: redeemPoints
        };
      }])
    .factory("DataStore", ['Buildfire', '$q', 'STATUS_CODE', 'STATUS_MESSAGES', function (Buildfire, $q, STATUS_CODE, STATUS_MESSAGES) {
      return {
        get: function (_tagName) {
          var deferred = $q.defer();
          Buildfire.datastore.get(_tagName, function (err, result) {
            if (err) {
              return deferred.reject(err);
            } else if (result) {
              return deferred.resolve(result);
            }
            else {
              return deferred.reject(new Error('Result Not Found'));
            }
          });
          return deferred.promise;
        },
        save: function (_item, _tagName) {
          var deferred = $q.defer();
          if (typeof _item == 'undefined') {
            return deferred.reject(new Error({
              code: STATUS_CODE.UNDEFINED_DATA,
              message: STATUS_MESSAGES.UNDEFINED_DATA
            }));
          }
          Buildfire.datastore.save(_item, _tagName, function (err, result) {
            if (err) {
              return deferred.reject(err);
            } else if (result) {
              return deferred.resolve(result);
            }
          });
          return deferred.promise;
        },
        onUpdate: function () {
          var deferred = $q.defer();
          var onUpdateFn = Buildfire.datastore.onUpdate(function (event) {
            if (!event) {
              return deferred.notify(new Error({
                code: STATUS_CODE.UNDEFINED_DATA,
                message: STATUS_MESSAGES.UNDEFINED_DATA
              }), true);
            } else {
              return deferred.notify(event);
            }
          }, true);
          return deferred.promise;
        }
      }
    }])
    .factory('RewardCache', ['$rootScope', function ($rootScope) {
      var reward = {};
      var application = {};
      return {
        setReward: function (data) {
          reward = data;
        },
        getReward: function () {
          return reward;
        },
        setApplication: function (data) {
          application = data;
        },
        getApplication: function () {
          return application;
        }
      };
    }])
    .factory('Context', ['$q', function ($q) {
      var context = null;
      return {
        getContext: function (cb) {
          if (context) {
            cb && cb(context);
            return context;
          }
          else {
            buildfire.getContext(function (err, _context) {
              if (err) {
                cb && cb(null);
                return null;
              }
              else {
                context = _context;
                cb && cb(_context);
                return context;
              }
            });
          }
        }
      };
    }])
    .factory('FyberAPI', ['LoyaltyAPI', 'ViewStack', '$rootScope', '$http', 'Context', function (LoyaltyAPI, ViewStack, $rootScope, $http, Context) {
      var instanceId = Context.getContext().instanceId;
      var userid = null;
      var credentials = {};
      var socket;
      var recieveCallback = () => { };

      var appid = "appid=106186&"
      var format = "format=json&"
      var googleID = "google_ad_id=2E7CE4B3-F68A-44D9-A923-F4E48D92B31E&google_ad_id_limited_tracking_enabled=false&"
      var locale = "locale=en&os_version=9.0&"
      var timestamp = "timestamp=1503159710&"
      var uid = "uid=player&"
      var hashkey = "hashkey=b4dd3ecf31ddda9d3bbac29abf2f6a933419fb1f";
      var apiKey = "3c548e669647a891d9fd543a12721216897ca63b"
      var userId = "";
      return {
        getAds: getAds,
        receiveOffers: receiveOffers
      }
      function getAds(callback) {
        buildfire.auth.getCurrentUser((err, user) => {
          if (user) {
            //getting saved credentials
            buildfire.datastore.get("credentials", (err, data) => {
              if (err) {
                return buildfire.notifications.alert({ message: "No credentials found" }, () => { });
              }
              else {
                var credentials = data.data;
                socket = io(credentials.server);
                var emitKey = user._id;
                credentials.uid = emitKey;
                credentials.os = Detect.OS;
                socket.emit('getOffer', credentials);
                socket.on(emitKey, receiveOffers);
                console.log('---------------------------Username----------------------------');
                console.log(emitKey);
                var onreward = 'reward' + emitKey;
                socket.on(onreward, (data) => {
                  LoyaltyAPI.addLoyaltyPoints(user._id, user.userToken, instanceId, '12345', parseInt(data.amount))
                    .then((success) => {
                      $rootScope.$broadcast('POINTS_ADDED', parseInt(data.amount));
                      var nPlugin = credentials.plugin;
                      ViewStack.push({
                        template: 'Offerwall'
                      });

                    }, (error) => {
                      console.log(error)
                    });
                });
                recieveCallback = callback;
              }

            });

          }
        });
      }

      function receiveOffers(data) {
        recieveCallback(data);
      }
    }])
})(window.angular, window.buildfire);