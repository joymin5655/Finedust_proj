import type { PM25Prediction, HistoryRecord } from '../types';
import { githubStorage } from './githubStorage';
import { localStorageService } from './localStorage';

/**
 * Storage Manager
 * GitHub와 로컬 저장소를 통합 관리
 * 오프라인 우선 전략 사용
 */
class StorageManager {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    // 온라인/오프라인 상태 모니터링
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.autoSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 페이지 로드 시 자동 동기화
    if (this.isOnline) {
      this.autoSync();
    }
  }

  /**
   * 새로운 측정 기록 저장
   * 로컬에 먼저 저장하고, 온라인이면 GitHub에도 저장
   */
  async saveRecord(prediction: PM25Prediction): Promise<HistoryRecord> {
    // 1. 로컬에 저장 (오프라인 우선)
    const record = localStorageService.addRecord(prediction);

    // 2. 온라인이면 GitHub에도 저장 시도
    if (this.isOnline) {
      try {
        await githubStorage.addRecord(prediction);
        localStorageService.markAsSynced(record.id);
        record.synced = true;
      } catch (error) {
        console.warn('Failed to sync to GitHub, will retry later:', error);
      }
    }

    return record;
  }

  /**
   * 기록 가져오기
   * 로컬 저장소에서 가져옴
   */
  getHistory(): HistoryRecord[] {
    return localStorageService.getHistory();
  }

  /**
   * GitHub와 동기화
   * 로컬의 미동기화 기록들을 GitHub에 업로드
   */
  async syncToGitHub(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, failed: 0 };
    }

    this.syncInProgress = true;

    try {
      const unsyncedRecords = localStorageService.getUnsyncedRecords();

      if (unsyncedRecords.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      let synced = 0;
      let failed = 0;

      // GitHub에서 현재 데이터 가져오기
      const githubRecords = await githubStorage.fetchData();

      // 미동기화 기록 추가
      for (const record of unsyncedRecords) {
        try {
          // 중복 체크 (이미 GitHub에 있는지)
          const exists = githubRecords.some(r => r.id === record.id);

          if (!exists) {
            githubRecords.unshift(record);
          }

          localStorageService.markAsSynced(record.id);
          synced++;
        } catch (error) {
          console.error(`Failed to sync record ${record.id}:`, error);
          failed++;
        }
      }

      // GitHub에 저장
      if (synced > 0) {
        // 최대 100개까지만 저장
        if (githubRecords.length > 100) {
          githubRecords.length = 100;
        }

        await githubStorage.saveData(githubRecords);
      }

      return { success: true, synced, failed };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, synced: 0, failed: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * GitHub에서 데이터 가져와서 로컬과 병합
   */
  async pullFromGitHub(): Promise<void> {
    try {
      const githubRecords = await githubStorage.fetchData();
      const localRecords = localStorageService.getHistory();

      // ID를 기준으로 중복 제거하며 병합
      const mergedMap = new Map<string, HistoryRecord>();

      // 로컬 데이터 먼저 추가
      localRecords.forEach(record => {
        mergedMap.set(record.id, record);
      });

      // GitHub 데이터 병합 (synced: true로 표시)
      githubRecords.forEach(record => {
        if (!mergedMap.has(record.id)) {
          mergedMap.set(record.id, { ...record, synced: true });
        }
      });

      // 타임스탬프 기준 정렬
      const merged = Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);

      // 최대 100개까지만 저장
      if (merged.length > 100) {
        merged.length = 100;
      }

      localStorageService.saveHistory(merged);
    } catch (error) {
      console.error('Failed to pull from GitHub:', error);
      throw error;
    }
  }

  /**
   * 자동 동기화 (온라인 상태일 때)
   */
  private async autoSync(): Promise<void> {
    const settings = localStorageService.getSettings();

    if (!settings.autoSync || settings.offlineMode) {
      return;
    }

    try {
      // GitHub에서 데이터 가져오기
      await this.pullFromGitHub();

      // 미동기화 기록 업로드
      await this.syncToGitHub();
    } catch (error) {
      console.warn('Auto-sync failed:', error);
    }
  }

  /**
   * 수동 동기화
   */
  async manualSync(): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline) {
      return {
        success: false,
        message: 'You are offline. Please check your internet connection.',
      };
    }

    try {
      await this.pullFromGitHub();
      const result = await this.syncToGitHub();

      if (result.success) {
        return {
          success: true,
          message: `Synced ${result.synced} records successfully.`,
        };
      } else {
        return {
          success: false,
          message: 'Sync failed. Please try again.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Sync failed. Please check your GitHub settings.',
      };
    }
  }

  /**
   * 연결 상태 확인
   */
  async checkGitHubConnection(): Promise<boolean> {
    return await githubStorage.checkConnection();
  }

  /**
   * 기록 삭제
   */
  deleteRecord(recordId: string): void {
    localStorageService.deleteRecord(recordId);
  }

  /**
   * 모든 기록 삭제
   */
  clearAllHistory(): void {
    localStorageService.clearHistory();
  }

  /**
   * 온라인 상태 확인
   */
  get online(): boolean {
    return this.isOnline;
  }

  /**
   * 동기화 상태 확인
   */
  get isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * 미동기화 기록 수 확인
   */
  getUnsyncedCount(): number {
    return localStorageService.getUnsyncedRecords().length;
  }
}

export const storageManager = new StorageManager();
