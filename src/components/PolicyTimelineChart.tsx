import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import type { TimelineEvent } from '../logic/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface PolicyTimelineChartProps {
  timeline: TimelineEvent[];
  implementationDate: string;
}

const PolicyTimelineChart = ({ timeline, implementationDate }: PolicyTimelineChartProps) => {
  const data = {
    labels: timeline.map(t => t.date),
    datasets: [
      {
        label: 'Actual PM2.5',
        data: timeline.map(t => t.pm25),
        fill: false,
        borderColor: '#25e2f4',
        borderWidth: 3,
        pointBackgroundColor: '#25e2f4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#25e2f4',
        tension: 0.4,
        zIndex: 2,
      },
      {
        label: 'Synthetic Counterfactual',
        data: timeline.map(t => t.syntheticPM25 || null),
        fill: true,
        backgroundColor: 'rgba(156, 163, 175, 0.05)',
        borderColor: 'rgba(156, 163, 175, 0.4)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.4,
        zIndex: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 10, weight: 'bold' as const, family: 'Inter' },
          color: '#64748b',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(16, 33, 34, 0.9)',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          afterBody: (context: TooltipItem<"line">[]) => {
            const index = context[0].dataIndex;
            const event = timeline[index].event;
            return event ? `Event: ${event}` : '';
          }
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line' as const,
            xMin: implementationDate,
            xMax: implementationDate,
            borderColor: '#f97316',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: true,
              content: 'Policy Implementation',
              position: 'center' as const,
              backgroundColor: 'rgba(249, 115, 22, 0.9)',
              color: '#fff',
              font: { size: 10, weight: 'bold' as const },
              padding: 6,
              borderRadius: 4,
            }
          },
          box1: {
            type: 'box' as const,
            xMin: implementationDate,
            backgroundColor: 'rgba(37, 226, 244, 0.03)',
            borderWidth: 0,
            label: {
              display: true,
              content: 'POST-POLICY EFFECT',
              position: 'start' as const,
              color: 'rgba(37, 226, 244, 0.4)',
              font: { size: 9, weight: 'bold' as const, family: 'Inter' },
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(156, 163, 175, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          callback: (value: string | number) => `${value} µg/m³`,
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        }
      }
    }
  };

  return (
    <div className="h-full w-full p-4">
      <Line data={data} options={options} />
    </div>
  );
};

export default PolicyTimelineChart;