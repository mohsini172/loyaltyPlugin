'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetOfferwallCtrl', ['$scope', '$timeout', 'ViewStack', 'FyberAPI', 'RewardCache', 'TAG_NAMES', 'DataStore', '$sce', '$rootScope',
      function ($scope, $timeout, ViewStack, FyberAPI, RewardCache, TAG_NAMES, DataStore, $sce, $rootScope) {

        var WidgetOfferwall = this;
        var breadCrumbFlag = true;
        WidgetOfferwall.offers = null;
        WidgetOfferwall.listeners = {};
        WidgetOfferwall.trustSrc = function (src) {
          var temp = $sce.trustAsResourceUrl(src);
          console.log(temp);
          return temp;
        }
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
            WidgetOfferwall.offers = JSON.parse(offers).offers;
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
