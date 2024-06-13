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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BusinessOutcomesChartProps {
    individualData: any[];
}

const BusinessOutcomesChart: FC<BusinessOutcomesChartProps> = ({ individualData }) => {
    const outcomeCounts = individualData.reduce((acc: Record<string, number>, item) => {
        const outcome = item.business_outcome;
        if (outcome) {
            const firstTwoWords = outcome.split(' ').slice(0, 2).join(' ').toLowerCase();
            acc[firstTwoWords] = (acc[firstTwoWords] || 0) + 1;
        }
        return acc;
    }, {});

    const sortedOutcomes = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1]);

    const chartData = {
        labels: sortedOutcomes.map(([outcome]) => outcome),
        datasets: [
            {
                label: "Business Outcomes",
                data: sortedOutcomes.map(([, count]) => count),
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
                text: "Business Outcomes",
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default BusinessOutcomesChart;
