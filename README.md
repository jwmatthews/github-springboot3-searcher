# GitHub Spring Boot 3 Repository Searcher

A command-line tool to search GitHub for public Java repositories using Spring Boot 3.

## Features

- Search for GitHub repositories mentioning Spring Boot 3 and Java
- Optional verification by checking actual build files (pom.xml, build.gradle)
- Sort and filter results
- Pagination support
- Colorful formatted output

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Setup

1. Clone the repo
2. Install dependencies
    ```bash
    npm install
    ```
3. Build the project
    ```bash
    npm run build
    ```
4. Create a .env file with your GitHub token to avoid rate limits
    ```bash
    echo "GITHUB_TOKEN=your_github_token_here" > .env
    ```

## Usage
Run the CLI tool:

```bash
npm start
```
Or use with command-line options:

```bash
npm start -- --page 1 --per-page 50 --sort stars --order desc --verify
```

Options
* -p, --page <number>: Page number to fetch (default: 1)
* -n, --per-page <number>: Results per page (max: 100, default: 30)
* -s, --sort <criteria>: Sort criteria - stars, forks, updated (default: updated)
* -o, --order <order>: Sort order - asc, desc (default: desc)
* -v, --verify: Verify Spring Boot 3 usage by checking build files (default: false)