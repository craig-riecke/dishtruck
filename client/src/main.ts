import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

Sentry.init({
  dsn: 'https://2f34b91e50374ffe9ecae5b8984d9e8d@o4504488432893952.ingest.sentry.io/4504488436826112',
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: [
        'us-central1-dishtruck.cloudfunctions.net',
        'us-central1-dishtruck-production.cloudfunctions.net',
      ],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.0,
  environment: environment.production ? 'production' : 'development',
  release: '2023-01-22 08:00',
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
