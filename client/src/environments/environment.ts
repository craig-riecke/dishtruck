// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // DISHTRUCK_API_BASE_URL: 'http://localhost:8080',
  DISHTRUCK_API_BASE_URL: 'https://us-central1-dishtruck.cloudfunctions.net',
  OAUTH2_CLIENT_ID:
    '952379108326-ct5jshq38p20tr910lnkh57c0hdqqf75.apps.googleusercontent.com', // Dev
  //'509649316488-ebpumqe2jhikr5dfafu4vl9scol6nd6b.apps.googleusercontent.com', // Prod
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
