import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, TrashIcon, CloudSyncIcon } from './Icons';
import { storageManager } from '../services/storageManager';
import type { HistoryRecord } from '../types';
import { formatDate, formatRelativeTime, getAQILevel } from '../utils/helpers';

interface HistoryViewProps {
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const records = storageManager.getHistory();
    setHistory(records);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');

    try {
      const result = await storageManager.manualSync();
      setSyncMessage(result.message);

      if (result.success) {
        loadHistory(); // Reload history after sync
      }
    } catch (error) {
      setSyncMessage('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = (recordId: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      storageManager.deleteRecord(recordId);
      loadHistory();
      setSelectedRecord(null);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
      storageManager.clearAllHistory();
      loadHistory();
      setSelectedRecord(null);
    }
  };

  const unsyncedCount = storageManager.getUnsyncedCount();
  const isOnline = storageManager.online;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="p-6 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold tracking-tight">History</h2>
        </div>

        <div className="flex items-center gap-3">
          {unsyncedCount > 0 && (
            <span className="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-full shadow-lg">
              {unsyncedCount} unsynced
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || !isOnline}
            className="p-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 shadow-lg"
          >
            <CloudSyncIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {syncMessage && (
        <div className={`mx-6 mt-4 p-4 rounded-2xl font-medium shadow-lg ${syncMessage.includes('success') ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'}`}>
          {syncMessage}
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-xl font-bold">No history yet</p>
            <p className="text-base mt-3 text-gray-400">Your measurements will appear here</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
                {history.length} record{history.length !== 1 ? 's' : ''}
              </p>
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-4">
              {history.map((record) => {
                const aqiLevel = getAQILevel(record.prediction.pm25);
                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className={`text-4xl font-bold ${aqiLevel.color}`}>
                            {record.prediction.pm25.toFixed(0)}
                          </span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">μg/m³</span>
                          <span className={`text-sm font-bold ${aqiLevel.color}`}>
                            {aqiLevel.name}
                          </span>
                        </div>

                        {record.prediction.location && (
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            📍 {record.prediction.location.city}, {record.prediction.location.country}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <span>{formatRelativeTime(record.timestamp)}</span>
                          <span>•</span>
                          <span>{formatDate(record.timestamp)}</span>
                          {!record.synced && (
                            <>
                              <span>•</span>
                              <span className="text-orange-500 font-semibold">Not synced</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id);
                        }}
                        className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 active:scale-90 transition-all duration-200"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selectedRecord && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Measurement Details</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">PM2.5 Value</p>
                <p className="text-3xl font-bold">{selectedRecord.prediction.pm25.toFixed(1)} μg/m³</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Air Quality Level</p>
                <p className={`text-lg font-semibold ${getAQILevel(selectedRecord.prediction.pm25).color}`}>
                  {getAQILevel(selectedRecord.prediction.pm25).name}
                </p>
              </div>

              {selectedRecord.prediction.location && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-base">
                    {selectedRecord.prediction.location.city}, {selectedRecord.prediction.location.country}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedRecord.prediction.location.latitude.toFixed(4)}, {selectedRecord.prediction.location.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
                <p className="text-base">{formatDate(selectedRecord.timestamp)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                <p className="text-base">{(selectedRecord.prediction.confidence * 100).toFixed(0)}%</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Data Sources</p>
                <div className="flex gap-2 mt-1">
                  {selectedRecord.prediction.sources.map((source) => (
                    <span
                      key={source}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Breakdown</p>
                <div className="space-y-1 mt-1">
                  {selectedRecord.prediction.breakdown.camera > 0 && (
                    <p className="text-sm">Camera: {selectedRecord.prediction.breakdown.camera.toFixed(1)} μg/m³</p>
                  )}
                  {selectedRecord.prediction.breakdown.station > 0 && (
                    <p className="text-sm">Station: {selectedRecord.prediction.breakdown.station.toFixed(1)} μg/m³</p>
                  )}
                  {selectedRecord.prediction.breakdown.satellite > 0 && (
                    <p className="text-sm">Satellite: {selectedRecord.prediction.breakdown.satellite.toFixed(1)} μg/m³</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
