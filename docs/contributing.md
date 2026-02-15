# Contributing Guide

Thank you for your interest in contributing to Wocon! This guide will help you understand how to contribute to the project effectively.

## Code of Conduct

We expect all contributors to adhere to our Code of Conduct:

- **Respect** everyone in the community
- **Be inclusive** and welcoming to new contributors
- **Constructive** feedback only
- **Collaborate** with others
- **Focus** on the best interests of the project

## Getting Started

### 1. Setup Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wocon-org/wocon_pages.git
   cd wocon_pages
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** based on the `.env.example` template:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### 2. Understand the Project Structure

```
wocon_pages/
├── src/
│   ├── components/         # Vue components
│   ├── lib/                # Utility libraries
│   ├── modules/            # Feature modules
│   ├── views/              # Page components
│   ├── assets/             # Static assets
│   ├── router/             # Vue Router configuration
│   └── main.ts             # Application entry
├── public/                 # Public files
├── docs/                   # Documentation
├── tests/                  # Test files
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# For features
git checkout -b feature/feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/documentation-update
```

### 2. Make Changes

- **Follow the existing code style**
- **Write clean, maintainable code**
- **Add comments where necessary**
- **Ensure TypeScript types are correct**
- **Test your changes**

### 3. Run Tests

```bash
# Run all tests
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### 4. Commit Changes

Use conventional commit messages:

```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Format**:
- `feat: ` for new features
- `fix: ` for bug fixes
- `docs: ` for documentation changes
- `style: ` for code style changes
- `refactor: ` for code refactoring
- `test: ` for test changes
- `chore: ` for build/CI changes

### 5. Push Changes

```bash
git push origin branch-name
```

### 6. Create a Pull Request

1. Go to the [GitHub repository](https://github.com/wocon-org/wocon_pages)
2. Click "Pull requests"
3. Click "New pull request"
4. Select your branch from the dropdown
5. Add a descriptive title and detailed description
6. Reference any related issues
7. Click "Create pull request"

## Code Review Process

1. **Automated Checks**: GitHub Actions will run tests, linting, and type checking
2. **Manual Review**: Maintainers will review your code
3. **Feedback**: You may receive feedback that requires changes
4. **Approval**: Once approved, your changes will be merged

## Best Practices

### 1. Code Quality

- **TypeScript**: Use proper types and interfaces
- **Vue 3**: Use Composition API for new components
- **CSS**: Follow the MD3 design system
- **Performance**: Optimize for speed and efficiency
- **Accessibility**: Ensure WCAG compliance

### 2. Testing

- **Write unit tests** for new functionality
- **Test edge cases**
- **Ensure existing tests pass**
- **Add integration tests** for complex features

### 3. Documentation

- **Update documentation** for new features
- **Add JSDoc comments** for functions and components
- **Write clear commit messages**
- **Update CHANGELOG.md** when appropriate

### 4. Security

- **Never commit secrets** or API keys
- **Use environment variables** for configuration
- **Sanitize user input**
- **Follow security best practices**

## Reporting Issues

### 1. Bug Reports

When reporting bugs:

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template**
3. **Include steps to reproduce**
4. **Add expected vs. actual behavior**
5. **Include screenshots** if helpful
6. **Specify environment details** (browser, OS, etc.)

### 2. Feature Requests

When requesting features:

1. **Search existing requests** to avoid duplicates
2. **Use the feature request template**
3. **Describe the problem** you're trying to solve
4. **Explain the proposed solution**
5. **Include any relevant examples**
6. **Discuss alternatives considered**

## Getting Help

If you need help contributing:

1. **Read the documentation** in the `docs/` directory
2. **Check existing issues** for similar problems
3. **Join our Discord server** (if available)
4. **Ask questions** in the GitHub Discussions

## Recognition

Contributors will be recognized in:

- **CHANGELOG.md** for significant contributions
- **README.md** contributors list
- **GitHub Contributors** page

## Release Process

1. **Create a release branch** from `main`
2. **Update version number** in `package.json`
3. **Update CHANGELOG.md** with all changes
4. **Run final tests** and build
5. **Create a GitHub Release** with release notes
6. **Deploy** to Cloudflare Pages

## License

By contributing to Wocon, you agree that your contributions will be licensed under the MIT License.

## Thank You

We appreciate all contributions, big or small! Every contribution helps make Wocon a better project.

Happy coding! 🚀