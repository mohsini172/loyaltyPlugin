'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetOfferwallCtrl', ['$scope', '$timeout', 'ViewStack', 'FyberAPI', 'RewardCache', 'TAG_NAMES', 'DataStore', '$sce', '$rootScope',
      function ($scope, $timeout, ViewStack, FyberAPI, RewardCache, TAG_NAMES, DataStore, $sce, $rootScope) {
        var WidgetOfferwall = this;
        var breadCrumbFlag = true;
        WidgetOfferwall.isError = false;
        WidgetOfferwall.offers = null;
        WidgetOfferwall.listeners = {};
        WidgetOfferwall.srcPaymentWall = "";
        WidgetOfferwall.trustSrc = function (src) {
          var temp = $sce.trustAsResourceUrl(src);
          console.log(temp);
          return temp;
        }
        buildfire.auth.getCurrentUser((err, user) => {
          if (user) {
            buildfire.datastore.get("credentials", (err, data) => {
              if (err) {
                return buildfire.notifications.alert({ message: "No credentials found" }, () => { });
              }
              else {
                var credentials = data.data;
                var uid = user._id;
                var server = credentials.server;
                var widgetid = credentials.widgetid;
                var publicKey = credentials.key;
                var secretKey = credentials.secretKey;
                var hash = sha256('email=' + 'mohsini172@gmail.com' + "evaluation=1" + "key=" + publicKey + "sign_version=3" + "uid=" + uid + 'widget=' + widgetid + secretKey);
                var params = "key=" + publicKey + "&uid=" + uid + '&widget=' + widgetid + "&sign_version=3" + '&email=' + 'mohsini172@gmail.com' + "&evaluation=1" + '&sign=' + hash;
                $timeout(function(){
                  WidgetOfferwall.srcPaymentWall = 'https://api.paymentwall.com/api/?' + params;
                }, 100)
                

              }
            });
          }
        });
        buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
          if (result && result.length) {
            result.forEach(function (breadCrumb) {
              if (breadCrumb.label == 'Offerwall') {
                breadCrumbFlag = false;
              }
            });
          }
          if (breadCrumbFlag) {
            buildfire.history.push('Offerwall', { elementToShow: 'Offerwall' });
          }
        });


        buildfire.spinner.show()
        //Fyber API: Fetching ads
        FyberAPI.getAds(function (offers) {
          $timeout(() => {
            buildfire.spinner.hide()
            offers = JSON.parse(offers);
            if (offers.code != 'OK' && offers.code != 'NO_CONTENT') {
              WidgetOfferwall.isError = true;
              offers.message = offers.message.replace('hash', 'api');
              WidgetOfferwall.error_message = "There is some error in fetching the offers please make sure you have provided the right credentials.";
            }
            else {
              WidgetOfferwall.offers = offers.offers;
            }
          }, 100);

        });


        //Refresh item details on pulling the tile bar

        buildfire.datastore.onRefresh(function () {
        });

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Offerwall" view.
         */
        var currentView = ViewStack.getCurrentView();

        /*Get application data*/
        WidgetOfferwall.init = function () {
          WidgetOfferwall.success = function (result) {
            WidgetOfferwall.data = result.data;
          };
          WidgetOfferwall.error = function (err) {
            console.error('Error while getting data', err);
          };
          DataStore.get(TAG_NAMES.LOYALTY_INFO).then(WidgetOfferwall.success, WidgetOfferwall.error);
        };

        /*covert html symbols to currency symbol*/
        WidgetOfferwall.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetOfferwall.onUpdateCallback = function (event) {
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.LOYALTY_INFO:
                  WidgetOfferwall.data = event.data;
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };

        WidgetOfferwall.preventClickBehavior = function (event) {
          console.log("**********", event);
          event.stopPropagation();
        };

        /**
         * Method to check if user has exceeded the total points limit.
         */
        WidgetOfferwall.init();

        WidgetOfferwall.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (ViewStack.getCurrentView().template == 'Offerwall') {
            buildfire.datastore.onRefresh(function () {
            });
          }
        });

        WidgetOfferwall.openOffer = function (link) {
          buildfire.navigation.openWindow(link, '_system', function () {
            console.log("returned");
          })
        }

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, WidgetOfferwall.onUpdateCallback);

      }]);
})(window.angular);
