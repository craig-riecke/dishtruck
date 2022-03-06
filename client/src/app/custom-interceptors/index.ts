/* "Barrel" of Custom Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { JwtInterceptor } from './jwt-interceptor';

/** Http interceptor providers in outside-in order */
export const customInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
];
