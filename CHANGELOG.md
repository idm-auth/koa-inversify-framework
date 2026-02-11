# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial framework release with core DDD abstractions
- Koa integration with Inversify DI container
- MongoDB repository pattern with CRUD operations
- Request/response validation with Zod
- OpenTelemetry tracing and structured logging
- Multi-tenant support with execution context
- Error handling middleware with standardized responses
- Pagination support for list operations

### Changed
- Middleware builder pattern refactored to functions

### Fixed
- Type safety improvements for Koa context

## [0.1.0] - 2024-01-01

### Added
- Project initialization
- Base abstractions (Controller, Service, Repository, Mapper)
- DI decorators (@Controller, @Service, @Repository, @Mapper)
- Infrastructure providers (Koa, MongoDB, Logger, Telemetry)
- GitHub Actions CI/CD workflows
