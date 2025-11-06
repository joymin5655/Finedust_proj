import type { HistoryRecord, PM25Prediction, AppSettings } from '../types';

const HISTORY_KEY = 'airlens_history';
const SETTINGS_KEY = 'airlens_settings';

/**
 * Local Storage Service
 * 로컬 저장소를 사용하여 오프라인 데이터 관리
 */
class LocalStorageService {
  /**
   * 측정 기록 가져오기
   */
  getHistory(): HistoryRecord[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get history from localStorage:', error);
      return [];
    }
  }

  /**
   * 측정 기록 저장
   */
  saveHistory(records: HistoryRecord[]): void {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
      throw error;
    }
  }

  /**
   * 새로운 측정 기록 추가
   */
  addRecord(prediction: PM25Prediction): HistoryRecord {
    const records = this.getHistory();

    const newRecord: HistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      prediction,
      synced: false,
    };

    records.unshift(newRecord);

    // 최대 100개까지만 저장
    if (records.length > 100) {
      records.length = 100;
    }

    this.saveHistory(records);
    return newRecord;
  }

  /**
   * 기록 동기화 상태 업데이트
   */
  markAsSynced(recordId: string): void {
    const records = this.getHistory();
    const record = records.find(r => r.id === recordId);

    if (record) {
      record.synced = true;
      this.saveHistory(records);
    }
  }

  /**
   * 동기화되지 않은 기록 가져오기
   */
  getUnsyncedRecords(): HistoryRecord[] {
    return this.getHistory().filter(r => !r.synced);
  }

  /**
   * 기록 삭제
   */
  deleteRecord(recordId: string): void {
    const records = this.getHistory();
    const filtered = records.filter(r => r.id !== recordId);
    this.saveHistory(filtered);
  }

  /**
   * 모든 기록 삭제
   */
  clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  }

  /**
   * 설정 가져오기
   */
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      const defaultSettings: AppSettings = {
        darkMode: true,
        language: 'en',
        autoSync: true,
        offlineMode: false,
      };

      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (error) {
      console.error('Failed to get settings from localStorage:', error);
      return {
        darkMode: true,
        language: 'en',
        autoSync: true,
        offlineMode: false,
      };
    }
  }

  /**
   * 설정 저장
   */
  saveSettings(settings: Partial<AppSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw error;
    }
  }

  /**
   * 저장소 크기 확인 (대략적)
   */
  getStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
}

export const localStorageService = new LocalStorageService();
