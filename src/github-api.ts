import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import { SearchResult } from './models/search-result';
import dotenv from 'dotenv';

dotenv.config();

export class GitHubApi {
  private baseUrl: string = 'https://api.github.com';
  private token: string | undefined = process.env.GITHUB_TOKEN;

  /**
   * Search for public Java repositories using Spring Boot 3
   * 
   * @param page Page number for pagination
   * @param perPage Number of results per page (max 100)
   * @param sortBy Field to sort by (stars, forks, updated)
   * @param order Sort order (asc or desc)
   * @returns Search results including repositories
   */
  async searchSpringBoot3Repositories(
    page: number = 1,
    perPage: number = 30,
    sortBy: 'stars' | 'forks' | 'updated' = 'updated',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<SearchResult> {
    try {
      // Build the search query
      // We'll search for repositories that mention Spring Boot 3
      // and are written in Java, excluding forks
      const query = encodeURIComponent(
        'spring boot 3 language:java is:public fork:false'
      );
      
      const url = `${this.baseUrl}/search/repositories?q=${query}&sort=${sortBy}&order=${order}&page=${page}&per_page=${perPage}`;
      
      const config: AxiosRequestConfig = {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        }
      };

      // Add authorization header if token is available
      if (this.token) {
        config.headers!['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await axios.get(url, config);
      
      return response.data as SearchResult;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 && error.response?.data?.message?.includes('rate limit')) {
          console.error('GitHub API rate limit exceeded. Consider adding a GITHUB_TOKEN in .env file.');
        } else {
          console.error(`GitHub API error: ${error.response?.data?.message || error.message}`);
        }
      } else {
        console.error(`Error: ${error}`);
      }
      throw error;
    }
  }

  /**
   * Verify if a repository uses Spring Boot 3 by checking its pom.xml or build.gradle
   * 
   * @param owner Repository owner (username or org)
   * @param repo Repository name
   * @returns true if the repo uses Spring Boot 3, false otherwise
   */
  async verifySpringBoot3Usage(owner: string, repo: string): Promise<boolean> {
    try {
      // First try to check pom.xml for Maven projects
      try {
        const pomUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/pom.xml`;
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/vnd.github.raw',
            'X-GitHub-Api-Version': '2022-11-28',
          }
        };
        
        if (this.token) {
          config.headers!['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await axios.get(pomUrl, config);
        const pomContent = response.data;
        
        // Check if pom.xml contains Spring Boot 3.x.x reference
        if (pomContent.includes('<parent>') && 
            pomContent.includes('org.springframework.boot') && 
            /3\.\d+\.\d+/i.test(pomContent)) {
          return true;
        }
      } catch (error) {
        // If pom.xml is not found or can't be accessed, continue to check build.gradle
      }
      
      // Check build.gradle for Gradle projects
      try {
        const gradleUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/build.gradle`;
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/vnd.github.raw',
            'X-GitHub-Api-Version': '2022-11-28',
          }
        };
        
        if (this.token) {
          config.headers!['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await axios.get(gradleUrl, config);
        const gradleContent = response.data;
        
        // Check if build.gradle contains Spring Boot 3.x.x reference
        if (gradleContent.includes('org.springframework.boot') && 
            /springBootVersion\s*=\s*['"]3\.\d+\.\d+['"]/.test(gradleContent) ||
            /spring-boot-starter.+:3\.\d+\.\d+/.test(gradleContent)) {
          return true;
        }
      } catch (error) {
        // If build.gradle is not found, try build.gradle.kts
        try {
          const kotlinGradleUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/build.gradle.kts`;
          const config: AxiosRequestConfig = {
            headers: {
              'Accept': 'application/vnd.github.raw',
              'X-GitHub-Api-Version': '2022-11-28',
            }
          };
          
          if (this.token) {
            config.headers!['Authorization'] = `Bearer ${this.token}`;
          }

          const response = await axios.get(kotlinGradleUrl, config);
          const gradleKtsContent = response.data;
          
          // Check if build.gradle.kts contains Spring Boot 3.x.x reference
          if (gradleKtsContent.includes('org.springframework.boot') && 
              /version\s*\(\s*"3\.\d+\.\d+"\s*\)/.test(gradleKtsContent)) {
            return true;
          }
        } catch (error) {
          // No build system files found or accessible
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error verifying Spring Boot 3 usage: ${error}`);
      return false;
    }
  }
}

