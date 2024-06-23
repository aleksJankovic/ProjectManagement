import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {provideRouter, withRouterConfig} from '@angular/router';

import {routerConfig, routes} from './app.routes';
import {HttpClientModule, provideHttpClient, withInterceptors} from '@angular/common/http';
import {httpInterceptor} from "./helpers/http.interceptor";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatNativeDateModule} from "@angular/material/core";
import {MarkdownModule} from "ngx-markdown";


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig(routerConfig)),
    importProvidersFrom([HttpClientModule, MatNativeDateModule]),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(MarkdownModule.forRoot())
  ]
};
