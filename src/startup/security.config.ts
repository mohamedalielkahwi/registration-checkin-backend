import helmet from 'helmet';

export function initSecurityConfig(app): void {
  app.use(helmet());
  // Set content security policy (CSP)
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'example.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ['data:', 'example.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    }),
  );

  // Set HTTP Strict Transport Security (HSTS)
  app.use(
    helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    }),
  );

  // Prevent clickjacking attacks with X-Frame-Options
  app.use(helmet.frameguard({ action: 'deny' }));

  // Enable XSS protection with X-XSS-Protection
  app.use(helmet.xssFilter());

  // Prevent MIME type sniffing with X-Content-Type-Options
  app.use(helmet.noSniff());

  // Prevent IE from executing downloads in the site's context
  app.use(helmet.ieNoOpen());

  // Prevent browsers from embedding the site in frames
  app.use(helmet.dnsPrefetchControl());
}
