import chalk from 'chalk';
import { Repository } from '../models/repository';

export class RepositoryFormatter {
  /**
   * Format repository details for console output
   */
  static format(repo: Repository, verified: boolean = false): string {
    // Build a formatted string for repository details
    const header = chalk.bold.blueBright(`${repo.full_name} ${verified ? chalk.greenBright('✓') : ''}`);
    const description = repo.description ? 
      chalk.white(repo.description) : 
      chalk.gray('No description provided');
    
    const stats = [
      chalk.yellow(`★ ${repo.stargazers_count}`),
      chalk.cyan(`⑂ ${repo.forks_count}`),
      chalk.magenta(`⚠ ${repo.open_issues_count}`)
    ].join(' | ');
    
    let topics = '';
    if (repo.topics && repo.topics.length > 0) {
      topics = '\n' + repo.topics.map(t => chalk.white(` ${t} `)).join(' ');
    }
    
    const updated = chalk.gray(`Updated: ${new Date(repo.updated_at).toLocaleDateString()}`);
    const url = chalk.underline.green(repo.html_url);
    
    return `
${header}
${description}
${stats}${topics}
${updated} | ${url}
${'-'.repeat(50)}`;
  }

  /**
   * Format search summary
   */
  static formatSummary(total: number, current: number, verified: number): string {
    return `
${chalk.bold.white('Search Summary')}
${chalk.cyan(`Found ${total} repositories mentioning Spring Boot 3`)}
${chalk.green(`Verified ${verified} repositories actually using Spring Boot 3`)}
${chalk.gray(`Showing ${current} results from the current batch`)}
`;
  }
}

