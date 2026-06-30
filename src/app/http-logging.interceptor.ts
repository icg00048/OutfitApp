import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class HttpLoggingInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const startTime = performance.now();

    console.log(
      `[HTTP] REQUEST: ${request.method} ${request.url}`,
      request.body
    );

    return next.handle(request).pipe(
      tap((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          const elapsed = performance.now() - startTime;
          console.log(
            `[HTTP] RESPONSE: ${request.method} ${request.url} → ${event.status} (${elapsed.toFixed(0)}ms)`,
            'Body:', event.body
          );
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const elapsed = performance.now() - startTime;
        console.error(
          `[HTTP] ERROR: ${request.method} ${request.url}`,
          {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            elapsed: `${elapsed.toFixed(0)}ms`,
          }
        );

        // CORS/Network diagnostics
        if (error.status === 0) {
          console.error(
            '[HTTP] Status 0 detected - likely CORS, network, or SSL issue'
          );
          console.error(
            '  → Check: allowedOriginPatterns in Spring Boot CORS config'
          );
          console.error('  → Check: Network connectivity (WiFi/4G)'
          );
          console.error('  → Check: SSL certificate (if HTTPS tunnel)');
        }

        if (error.status === 403) {
          console.error('[HTTP] 403 Forbidden - likely CORS preflight failed');
        }

        if (error.error instanceof ErrorEvent) {
          console.error('[HTTP] Network error:', error.error.message);
        } else {
          console.error('[HTTP] Response error body:', error.error);
        }

        return throwError(() => error);
      })
    );
  }
}
