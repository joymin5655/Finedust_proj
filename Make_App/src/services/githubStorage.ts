import type { HistoryRecord, PM25Prediction } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO;
const DATA_PATH = 'data/history.json';

interface GitHubFileResponse {
  content: string;
  sha: string;
}

/**
 * GitHub Storage Service
 * GitHub를 데이터 저장소로 사용하여 측정 기록을 저장/불러오기
 */
class GitHubStorageService {
  private headers: HeadersInit;
  private fileSha: string | null = null;

  constructor() {
    this.headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * GitHub에서 데이터 파일 가져오기
   */
  async fetchData(): Promise<HistoryRecord[]> {
    try {
      const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`;
      const response = await fetch(url, { headers: this.headers });

      if (response.status === 404) {
        // 파일이 없으면 빈 배열 반환
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data: GitHubFileResponse = await response.json();
      this.fileSha = data.sha;

      // Base64 디코딩
      const content = atob(data.content.replace(/\n/g, ''));
      return JSON.parse(content) as HistoryRecord[];
    } catch (error) {
      console.error('Failed to fetch data from GitHub:', error);
      throw error;
    }
  }

  /**
   * GitHub에 데이터 저장
   */
  async saveData(records: HistoryRecord[]): Promise<void> {
    try {
      // 최신 SHA 가져오기 (충돌 방지)
      if (!this.fileSha) {
        await this.fetchData();
      }

      const content = btoa(JSON.stringify(records, null, 2));
      const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_PATH}`;

      const body: any = {
        message: `Update history: ${new Date().toISOString()}`,
        content,
        branch: 'main',
      };

      if (this.fileSha) {
        body.sha = this.fileSha;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const result = await response.json();
      this.fileSha = result.content.sha;
    } catch (error) {
      console.error('Failed to save data to GitHub:', error);
      throw error;
    }
  }

  /**
   * 새로운 측정 기록 추가
   */
  async addRecord(prediction: PM25Prediction): Promise<void> {
    try {
      const records = await this.fetchData();

      const newRecord: HistoryRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        prediction,
        synced: true,
      };

      records.unshift(newRecord);

      // 최대 100개까지만 저장
      if (records.length > 100) {
        records.length = 100;
      }

      await this.saveData(records);
    } catch (error) {
      console.error('Failed to add record:', error);
      throw error;
    }
  }

  /**
   * GitHub 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    try {
      const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;
      const response = await fetch(url, { headers: this.headers });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const githubStorage = new GitHubStorageService();
