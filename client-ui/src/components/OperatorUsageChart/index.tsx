// src/components/OperatorUsageChart/index.tsx

import { FC } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { OperatorResult } from "../../types/OperatorResult";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface OperatorUsageChartProps {
    operatorResults: OperatorResult[];
}

const OperatorUsageChart: FC<OperatorUsageChartProps> = ({ operatorResults }) => {
    const operatorCounts = operatorResults.reduce((acc: Record<string, number>, result) => {
        acc[result.name] = (acc[result.name] || 0) + 1;
        return acc;
    }, {});

    const sortedOperators = Object.entries(operatorCounts).sort(([, a], [, b]) => b - a);

    const chartData = {
        labels: sortedOperators.map(([name]) => name),
        datasets: [
            {
                label: "Operator Usage",
                data: sortedOperators.map(([, count]) => count),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Operator Usage",
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default OperatorUsageChart;
