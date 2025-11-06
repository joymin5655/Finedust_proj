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
      <header className="p-4 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold ml-4">History</h2>
        </div>

        <div className="flex items-center gap-2">
          {unsyncedCount > 0 && (
            <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
              {unsyncedCount} unsynced
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || !isOnline}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CloudSyncIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {syncMessage && (
        <div className={`mx-4 mt-4 p-3 rounded-lg ${syncMessage.includes('success') ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          {syncMessage}
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-lg font-semibold">No history yet</p>
            <p className="text-sm mt-2">Your measurements will appear here</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {history.length} record{history.length !== 1 ? 's' : ''}
              </p>
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {history.map((record) => {
                const aqiLevel = getAQILevel(record.prediction.pm25);
                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className={`text-3xl font-bold ${aqiLevel.color}`}>
                            {record.prediction.pm25.toFixed(0)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">μg/m³</span>
                          <span className={`text-sm font-semibold ${aqiLevel.color}`}>
                            {aqiLevel.name}
                          </span>
                        </div>

                        {record.prediction.location && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            📍 {record.prediction.location.city}, {record.prediction.location.country}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatRelativeTime(record.timestamp)}</span>
                          <span>•</span>
                          <span>{formatDate(record.timestamp)}</span>
                          {!record.synced && (
                            <>
                              <span>•</span>
                              <span className="text-orange-500">Not synced</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.id);
                        }}
                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                      >
                        <TrashIcon className="w-4 h-4" />
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
