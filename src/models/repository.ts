export interface Owner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  owner: Owner;
  created_at: string;
  updated_at: string;
  license: {
    name: string;
  } | null;
  visibility: string;
  default_branch: string;
}

