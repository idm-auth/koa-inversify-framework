# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please open a security advisory ticket on GitHub.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt of your report within 48 hours and provide an estimated timeline for a fix.

## Security Best Practices

When using this framework:

1. **Keep dependencies updated** - Regularly update npm packages
2. **Validate inputs** - Use the provided Zod validation middleware
3. **Authenticate requests** - Implement authentication middleware
4. **Authorize operations** - Use authorization decorators
5. **Use HTTPS** - Always use HTTPS in production
6. **Secure secrets** - Never commit credentials, use environment variables
7. **Enable CORS carefully** - Configure CORS to allow only trusted origins
8. **Rate limiting** - Implement rate limiting for public endpoints

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Dependencies

This project uses the following security-critical dependencies:
- Mongoose - MongoDB ODM
- Koa - Web framework
- Inversify - DI container
- Zod - Schema validation
- OpenTelemetry - Observability

We monitor these dependencies for security updates and apply patches promptly.
