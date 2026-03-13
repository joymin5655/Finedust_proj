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
        label: 'PM2.5 (µg/m³)',
        data: timeline.map(t => t.pm25),
        fill: true,
        backgroundColor: 'rgba(37, 226, 244, 0.1)',
        borderColor: '#25e2f4',
        borderWidth: 3,
        pointBackgroundColor: '#25e2f4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#25e2f4',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(16, 33, 34, 0.9)',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 14 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          afterBody: (context: any) => {
            const index = context[0].dataIndex;
            return `Event: ${timeline[index].event}`;
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
              content: 'Implementation',
              position: 'start' as const,
              backgroundColor: '#f97316',
              color: '#fff',
              font: { size: 10, weight: 'bold' as const },
              padding: 4,
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
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
          maxTicksLimit: 6,
        }
      }
    }
  };

  return (
    <div className="h-[300px] w-full">
      <Line data={data} options={options} />
    </div>
  );
};

export default PolicyTimelineChart;