import { FC } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface SentimentChartProps {
    individualData: any[];
}

const SentimentChart: FC<SentimentChartProps> = ({ individualData }) => {
    const aggregateSentimentData = (individualData: any[]) => {
        const aggregatedData = {
            labels: [] as string[],
            positive: [] as number[],
            neutral: [] as number[],
            negative: [] as number[],
        };

        individualData.forEach(item => {
            const date = new Date(item.date_created).toLocaleDateString();
            const index = aggregatedData.labels.indexOf(date);

            if (index === -1) {
                aggregatedData.labels.push(date);
                aggregatedData.positive.push(item.sentiment === "positive" ? 1 : 0);
                aggregatedData.neutral.push(item.sentiment === "neutral" ? 1 : 0);
                aggregatedData.negative.push(item.sentiment === "negative" ? 1 : 0);
            } else {
                aggregatedData.positive[index] += item.sentiment === "positive" ? 1 : 0;
                aggregatedData.neutral[index] += item.sentiment === "neutral" ? 1 : 0;
                aggregatedData.negative[index] += item.sentiment === "negative" ? 1 : 0;
            }
        });

        return aggregatedData;
    };

    const sentimentData = aggregateSentimentData(individualData);

    const chartData = {
        labels: sentimentData.labels,
        datasets: [
            {
                label: "Positive Sentiment",
                data: sentimentData.positive,
                fill: false,
                borderColor: "green",
            },
            {
                label: "Neutral Sentiment",
                data: sentimentData.neutral,
                fill: false,
                borderColor: "blue",
            },
            {
                label: "Negative Sentiment",
                data: sentimentData.negative,
                fill: false,
                borderColor: "red",
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
                text: "Sentiment Trends",
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default SentimentChart;
