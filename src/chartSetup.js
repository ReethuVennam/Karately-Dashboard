/* Registers the Chart.js pieces used by react-chartjs-2 on the Overview
   page (a bar chart + a mixed line chart with two y-axes). Imported once
   from main.jsx so registration happens before any <Bar>/<Line> mounts. */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend);
