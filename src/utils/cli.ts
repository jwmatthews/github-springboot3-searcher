import { Command } from 'commander';
import { GitHubApi } from '../github-api';
import { RepositoryFormatter } from './formatter';
import chalk from 'chalk';

export class CLI {
  private program: Command;
  private githubApi: GitHubApi;

  constructor() {
    this.program = new Command();
    this.githubApi = new GitHubApi();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('sb3-search')
      .description('CLI tool to search for public Java repos using Spring Boot 3')
      .version('1.0.0');

    this.program
      .option('-p, --page <number>', 'Page number to fetch', '1')
      .option('-n, --per-page <number>', 'Number of results per page (max 100)', '30')
      .option('-s, --sort <criteria>', 'Sort criteria (stars, forks, updated)', 'updated')
      .option('-o, --order <order>', 'Sort order (asc, desc)', 'desc')
      .option('-v, --verify', 'Verify Spring Boot 3 usage by checking build files', false)
      .action(async (options) => {
        await this.searchRepositories(
          parseInt(options.page),
          parseInt(options.perPage),
          options.sort,
          options.order,
          options.verify
        );
      });
  }

  private async searchRepositories(
    page: number,
    perPage: number,
    sortBy: string,
    order: string,
    verify: boolean
  ): Promise<void> {
    console.log(chalk.bold.greenBright('Searching for Java repositories using Spring Boot 3...'));
    
    try {
      // Validate and convert options
      if (perPage > 100) {
        console.warn(chalk.yellow('Warning: Maximum results per page is 100. Using 100.'));
        perPage = 100;
      }
      
      if (!['stars', 'forks', 'updated'].includes(sortBy)) {
        console.warn(chalk.yellow(`Warning: Invalid sort criteria '${sortBy}'. Using 'updated'.`));
        sortBy = 'updated';
      }
      
      if (!['asc', 'desc'].includes(order)) {
        console.warn(chalk.yellow(`Warning: Invalid order '${order}'. Using 'desc'.`));
        order = 'desc';
      }
      
      // Perform the search
      const result = await this.githubApi.searchSpringBoot3Repositories(
        page,
        perPage,
        sortBy as 'stars' | 'forks' | 'updated',
        order as 'asc' | 'desc'
      );
      
      if (result.items.length === 0) {
        console.log(chalk.yellow('No repositories found matching the criteria.'));
        return;
      }
      
      let verifiedCount = 0;
      
      // Process and display results
      for (const repo of result.items) {
        process.stdout.write(`Processing ${repo.full_name}... `);
        
        let isVerified = false;
        if (verify) {
          isVerified = await this.githubApi.verifySpringBoot3Usage(
            repo.owner.login,
            repo.name
          );
          
          if (isVerified) {
            verifiedCount++;
            process.stdout.write(chalk.green('✓\n'));
          } else {
            process.stdout.write(chalk.red('✗\n'));
          }
        } else {
          process.stdout.write(chalk.gray('skipped verification\n'));
        }
        
        // Only display repositories that are verified to use Spring Boot 3
        // when verification is enabled
        if (!verify || isVerified) {
          console.log(RepositoryFormatter.format(repo, isVerified));
        }
      }
      
      // Display summary
      console.log(RepositoryFormatter.formatSummary(
        result.total_count,
        result.items.length,
        verifiedCount
      ));
      
      if (result.incomplete_results) {
        console.log(chalk.yellow('Note: Results may be incomplete due to GitHub API limitations.'));
      }
      
      // Pagination info
      const totalPages = Math.ceil(result.total_count / perPage);
      console.log(chalk.cyan(`Page ${page} of approximately ${totalPages}`));
      
      if (page < totalPages) {
        console.log(chalk.green(`Use --page ${page + 1} to see the next page of results.`));
      }
    } catch (error) {
      console.error(chalk.red('Failed to search repositories:'));
      console.error(error);
    }
  }

  public async run(args: string[] = process.argv): Promise<void> {
    await this.program.parseAsync(args);
  }
}

