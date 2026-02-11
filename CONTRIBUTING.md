# Contributing

Thank you for your interest in contributing! Here's how you can help:

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/koa-inversify-framework.git`
3. Install dependencies: `npm ci`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Development

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Watch mode
npm run dev
```

## Code Style

- Use TypeScript for all code
- Follow the existing code style
- No `any` types - use proper type annotations
- Use meaningful variable and function names
- Write tests for new features

## Commit Messages

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for refactoring
- `chore:` for maintenance

Example: `feat: add authentication middleware`

## Pull Requests

1. Ensure all tests pass: `npm test`
2. Ensure linting passes: `npm run lint`
3. Ensure type checking passes: `npm run type-check`
4. Update documentation if needed
5. Add tests for new functionality
6. Write a clear PR description

## Testing

- Write unit tests for new features
- Maintain test coverage above 85%
- Use descriptive test names
- Mock external dependencies

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md with notable changes
- Include examples for complex features

## Questions?

Feel free to open an issue for questions or discussions.
