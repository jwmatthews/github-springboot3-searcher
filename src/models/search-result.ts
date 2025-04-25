import { Repository } from './repository';

export interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

