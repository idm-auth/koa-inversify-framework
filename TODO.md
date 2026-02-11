# TODO - Framework Features & Improvements

## 1. Authentication & Authorization 🔐

> **Architecture**: Framework uses `.external/auth-client-js` as framework-agnostic HTTP client library.
> The auth-client-js handles remote validation via IDM backend, while framework provides Koa adapter layer.

### Auth Client Library Integration
- [ ] Integrar `.external/auth-client-js` no framework
  - [ ] Adicionar como dependência local
  - [ ] Implementar IHttpClient adapter (FetchHttpClient ou custom)
  - [ ] Configurar IDM endpoint URL via Env provider
  - [ ] Documentar integration pattern

### Authentication Middleware (Koa Adapter)
- [ ] Implementar `authentication.build.middleware.ts`
  - [ ] Extrair token do header (Bearer scheme)
  - [ ] Extrair tenantId do route params
  - [ ] Chamar `authenticate()` do auth-client-js
  - [ ] Popular ctx.state.user com payload
  - [ ] Tratar erros (UnauthorizedError)
- [ ] Integrar com `@Authentication` decorator
- [ ] Suporte a múltiplos schemes (Bearer, Basic, API Key)
- [ ] Criar testes unitários (mock IHttpClient)
- [ ] Criar testes de integração (mock IDM backend)

### Authorization Middleware (Koa Adapter)
- [ ] Implementar `authorize.build.middleware.ts`
  - [ ] Extrair accountId do ctx.state.user
  - [ ] Extrair tenantId do ctx.state ou params
  - [ ] Construir action (system:resource:operation)
  - [ ] Construir resource (GRN format)
  - [ ] Chamar `authorize()` do auth-client-js
  - [ ] Tratar erros (ForbiddenError)
- [ ] Integrar com `@Authorize` decorator
  - [ ] Decorator recebe action e resource template
  - [ ] Middleware resolve templates com ctx data
- [ ] Criar testes unitários e de integração

### Context Provider Enhancement
- [ ] Expandir `context.provider.ts`
  - [ ] User context (accountId, email, roles)
  - [ ] Request context (requestId, traceId)
  - [ ] Tenant context (tenantId, partition, region)
  - [ ] Integrar com auth payload

## 2. Validation Improvements ✅

### Response Validation
- [x] Implementar `zodValidateResponse.build.middleware.ts`
  - [x] Validar responses contra schemas Zod
  - [x] Log de erros de validação
  - [x] Modo strict vs permissive
- [x] Integrar com `@ZodValidateResponse` decorator
- [ ] Adicionar testes

### Request Validation Enhancement
- [x] Implementar `zodValidateRequest.build.middleware.ts`
  - [x] Validação de params, query, body
  - [x] Mensagens de erro estruturadas
  - [x] Integração com Zod schemas
- [ ] Validação de headers
- [ ] Validação de cookies

## 3. Testing & Coverage 🧪

### Unit Tests
- [x] `errorHandler.middleware.ts` - DefaultErrorHandler implementado
- [ ] `zodValidateRequest.build.middleware.ts` (0% coverage)
- [ ] `zodValidateResponse.build.middleware.ts` (0% coverage)
- [ ] `authentication.build.middleware.ts` (0% coverage)
- [ ] `authorize.build.middleware.ts` (0% coverage)
- [ ] `executionContext.build.middleware.ts` (0% coverage)

### Integration Tests
- [ ] Authentication flow end-to-end
- [ ] Authorization flow end-to-end
- [x] Error handling scenarios - NotFoundError retorna 404
- [x] Multi-tenant isolation - DELETE test passando
- [x] ExecutionContext middleware - tenantId extraction funcionando

### Coverage Goals
- [ ] Atingir 85%+ de cobertura geral
- [ ] 100% cobertura em middlewares críticos
- [ ] 100% cobertura em decorators

## 4. Documentation 📚

### API Documentation
- [ ] Adicionar exemplos de uso no README
- [ ] Documentar padrões de erro
- [ ] Documentar fluxo de autenticação/autorização
- [ ] Criar guia de migração

### Code Documentation
- [ ] JSDoc em todas as classes públicas
- [ ] Exemplos de uso em comentários
- [ ] Documentar convenções de nomenclatura

### Usage Guide
- [ ] Atualizar `.doc/usage-guide.md`
  - [ ] Adicionar seção de autenticação
  - [ ] Adicionar seção de autorização
  - [ ] Adicionar seção de error handling
  - [ ] Adicionar exemplos de customização

## 5. Performance & Optimization ⚡

### Caching
- [ ] Implementar cache layer abstrato
- [ ] Cache de queries frequentes
- [ ] Cache de autenticação/autorização
- [ ] Invalidação de cache

### Database
- [ ] Connection pooling otimizado
- [ ] Índices sugeridos para queries comuns
- [ ] Query optimization helpers

### Monitoring
- [ ] Métricas de performance por endpoint
- [ ] Alertas de latência
- [ ] Dashboard de observabilidade

## 6. Developer Experience 🛠️

### CLI Tools
- [ ] Gerador de módulos DDD
- [ ] Gerador de controllers/services/repositories
- [ ] Migration helper

### Hot Reload
- [ ] Melhorar hot reload em desenvolvimento
- [ ] Watch mode para testes

### Error Messages
- [ ] Mensagens de erro mais descritivas
- [ ] Stack traces melhorados
- [ ] Sugestões de correção

## 7. Security 🔒

### Security Headers
- [ ] Implementar security headers middleware
- [ ] CORS configuration avançada
- [ ] Rate limiting
- [ ] Request size limits

### Input Sanitization
- [ ] XSS prevention
- [ ] SQL injection prevention (já coberto por Mongoose)
- [ ] Path traversal prevention

### Secrets Management
- [ ] Integração com secret managers (AWS Secrets Manager, Vault)
- [ ] Rotação automática de secrets
- [ ] Criptografia de dados sensíveis

## 8. Advanced Features 🚀

### Pagination
- [ ] Cursor-based pagination
- [ ] Offset-based pagination (já existe)
- [ ] Metadata de paginação (total, hasNext, hasPrev)

### Filtering & Sorting
- [ ] Query builder para filtros complexos
- [ ] Sorting multi-field
- [ ] Full-text search

### Batch Operations
- [ ] Bulk create
- [ ] Bulk update
- [ ] Bulk delete
- [ ] Transaction support

### Webhooks
- [ ] Webhook framework
- [ ] Event emitter
- [ ] Retry logic

## 9. Infrastructure 🏗️

### Observability
- [x] OpenTelemetry integration
- [x] Jaeger tracing
- [x] Structured logging (Pino)
- [x] Error tracking in traces
- [x] Span hierarchy (Controller → Service → Repository)
- [ ] Prometheus metrics
- [ ] Custom metrics (latency, throughput)

### Health Checks
- [ ] Health check endpoint
- [ ] Readiness probe
- [ ] Liveness probe
- [ ] Dependency health checks (MongoDB, external APIs)

### Graceful Shutdown
- [x] Shutdown sequence implementado
- [ ] Drain connections
- [ ] Finish pending requests

### Configuration
- [x] Environment variables (Env provider)
- [x] RuntimeConfigurationError para validação
- [ ] Feature flags

## 10. Refactoring & Tech Debt 🔧

### Code Quality
- [x] Middleware builder pattern refatorado (função ao invés de classe)
- [x] Naming conventions padronizadas (`.build.middleware.ts`)
- [x] Logger caching pattern implementado
- [x] Type safety melhorado (Context intersection types)
- [ ] Remover debug logs excessivos após estabilização

### Architecture
- [x] ExecutionContext como per-route middleware
- [x] Middleware execution order hardcoded e documentado
- [x] Error handler obrigatório com fallback
- [ ] Avaliar necessidade de novos abstracts

### Dependencies
- [ ] Atualizar dependências desatualizadas
- [ ] Remover dependências não utilizadas
- [ ] Avaliar alternativas mais leves

## 11. Package & Distribution 📦

### Documentation
- [ ] Criar README.md principal
  - [ ] Badges (coverage, build, npm version)
  - [ ] Quick start guide
  - [ ] Installation instructions
  - [ ] Basic usage examples
- [ ] Criar CHANGELOG.md
- [ ] Adicionar LICENSE file
- [ ] Documentar API exports

### Publishing
- [ ] Preparar para publicação no npm
  - [ ] Validar package.json metadata
  - [ ] Configurar .npmignore
  - [ ] Testar build output
- [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Automated tests on PR
  - [ ] Coverage reports
  - [ ] Automated releases
  - [ ] Publish to npm registry

## 12. Event System 🎯

### Domain Events
- [ ] Event emitter abstrato
- [ ] Domain events pattern
- [ ] Event handlers registration
- [ ] Async event processing
- [ ] Event metadata (timestamp, userId, traceId)

### Event Persistence
- [ ] Event store implementation
- [ ] Event sourcing support
- [ ] Event replay mechanism

### Integration
- [ ] Message broker abstraction
- [ ] RabbitMQ adapter
- [ ] Kafka adapter
- [ ] Event publishing middleware

## 13. Middleware Enhancements 🔧

### Request Processing
- [ ] Request ID middleware (correlation tracking)
- [ ] Response time middleware
- [ ] Compression middleware (gzip, brotli)
- [ ] Request logging middleware
- [ ] Content negotiation middleware

### API Features
- [ ] API versioning middleware
  - [ ] URL versioning (/v1/resource)
  - [ ] Header versioning (Accept-Version)
- [ ] ETag support (conditional requests)
- [ ] HATEOAS links generation

## 14. Query Features 🔍

### Filtering
- [ ] Advanced filtering DSL
  - [ ] Comparison operators ($gt, $lt, $gte, $lte)
  - [ ] Logical operators ($and, $or, $not)
  - [ ] Array operators ($in, $nin)
- [ ] Query string parser
- [ ] Type-safe query builder

### Data Shaping
- [ ] Field selection (sparse fieldsets)
- [ ] Relationship expansion (populate)
- [ ] Nested resource loading
- [ ] Projection optimization

### Search
- [ ] Full-text search integration
- [ ] Fuzzy search support
- [ ] Search highlighting
- [ ] Aggregation pipeline helpers

## 15. Validation Enhancements ✅

### Custom Validation
- [ ] Custom validation decorators
- [ ] Cross-field validation
- [ ] Async validation support
- [ ] Conditional validation rules

### Error Handling
- [ ] Validation error formatting customization
- [ ] Field-level error messages
- [ ] Error translation (i18n)
- [ ] Schema composition utilities

## 16. Repository Patterns 💾

### Data Management
- [ ] Soft delete support
  - [ ] deletedAt field
  - [ ] Restore functionality
  - [ ] Permanent delete
- [ ] Audit trail
  - [ ] createdBy, updatedBy fields
  - [ ] Change history tracking
- [ ] Optimistic locking (version field)

### Performance
- [ ] Bulk operations optimization
- [ ] Query result caching
- [ ] Read replicas support
- [ ] Connection pooling tuning
- [ ] Index recommendations

## 17. Testing Utilities 🧪

### Test Helpers
- [ ] Test fixtures generator
- [ ] Mock factories
- [ ] Database seeding utilities
- [ ] Test data builders

### Integration Testing
- [ ] Integration test helpers
- [ ] API test client wrapper
- [ ] Test container setup
- [ ] Snapshot testing support

### Coverage
- [ ] Coverage thresholds enforcement
- [ ] Mutation testing
- [ ] Performance benchmarks

## 18. Error Handling Improvements ❌

### Error Standards
- [ ] Error codes standardization
- [ ] Error severity levels
- [ ] Error categories (validation, business, system)
- [ ] Error context enrichment

### Resilience
- [ ] Retry strategies
  - [ ] Exponential backoff
  - [ ] Jitter
  - [ ] Max attempts
- [ ] Circuit breaker pattern
- [ ] Fallback mechanisms
- [ ] Timeout handling

### Localization
- [ ] I18n error messages
- [ ] Multi-language support
- [ ] Error message templates

---

## Progresso Recente ✨

### ✅ Concluído
- **Middleware Pattern**: Refatorado para função-based builders
- **ExecutionContext**: Implementado como per-route middleware
- **Error Handling**: DefaultErrorHandler + RuntimeConfigurationError
- **Validation**: Request e Response validation com Zod
- **Observability**: OpenTelemetry + Jaeger + Pino logging
- **Multi-tenancy**: TenantResolver + ExecutionContext integration
- **Service Layer**: Padrão `findById` → `buildUpdate` → `update`
- **Logger Optimization**: Lazy-loaded cached logger pattern
- **Auth Client Library**: `.external/auth-client-js` disponível (framework-agnostic)

### 🚧 Em Progresso
- Integrar `.external/auth-client-js` no framework
- Implementar authentication/authorization middlewares como adapters
- Adicionar testes unitários para middlewares

---

## Prioridades

### 🔥 Alta Prioridade
1. Authentication & Authorization (item 1) - **NEXT** (integrar auth-client-js)
2. Testing & Coverage (item 3)
3. Documentation (item 4)

### 🟡 Média Prioridade
4. Security (item 7)
5. Health Checks (item 9)
6. Package & Distribution (item 11)
7. Middleware Enhancements (item 13)

### 🟢 Baixa Prioridade
8. Advanced Features (item 8)
9. Query Features (item 14)
10. Event System (item 12)
11. Validation Enhancements (item 15)
12. Repository Patterns (item 16)
13. Testing Utilities (item 17)
14. Error Handling Improvements (item 18)
15. Performance & Optimization (item 5)
16. Developer Experience (item 6)
17. Refactoring (item 10) - **Parcialmente concluído**
