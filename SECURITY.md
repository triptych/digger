# Security Policy

## Reporting a Vulnerability

The Digger game project takes security seriously. If you believe you've found a security vulnerability in our project, please follow these steps to report it:

1. **Do Not** disclose the vulnerability publicly until it has been addressed by the maintainers.
2. Email details of the vulnerability to Andrew Wooldridge (project owner).
3. Include as much information as possible, such as:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any possible solutions you've identified

## Response Process

Once a security report is received, we will:

1. Confirm receipt of the vulnerability report
2. Assess the impact and severity of the vulnerability
3. Develop a fix and test it
4. Release the fix and acknowledge the reporter's contribution (unless anonymity is requested)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

As a predominantly client-side web game, Digger has limited exposure to traditional security vulnerabilities. However, we still observe these best practices:

- Avoid storing sensitive user data in localStorage without proper encryption
- Validate all input data, including saved game files
- Use Content Security Policy headers to prevent XSS attacks when applicable
- Keep all dependencies updated to prevent vulnerabilities in third-party code

## Third-Party Code

Digger is built with vanilla HTML, CSS, and JavaScript, minimizing exposure to vulnerabilities from third-party libraries. Any dependencies that might be added in the future will be carefully vetted and kept up to date.

## Responsible Disclosure

We kindly ask that researchers practice responsible disclosure and allow us reasonable time to address security issues before public disclosure.
