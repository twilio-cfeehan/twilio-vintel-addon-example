import { FC } from "react";
import {Bar, Chart} from "react-chartjs-2";
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
        const sentimentCountsByDate: Record<string, { positive: number, neutral: number, negative: number }> = {};

        individualData.forEach(item => {
            const date = new Date(item.date_created).toLocaleDateString();

            if (!sentimentCountsByDate[date]) {
                sentimentCountsByDate[date] = { positive: 0, neutral: 0, negative: 0 };
            }

            if (item.sentiment === "positive") sentimentCountsByDate[date].positive += 1;
            if (item.sentiment === "neutral") sentimentCountsByDate[date].neutral += 1;
            if (item.sentiment === "negative") sentimentCountsByDate[date].negative += 1;
        });

        const aggregatedData = {
            labels: Object.keys(sentimentCountsByDate),
            positive: [],
            neutral: [],
            negative: [],
        };

        aggregatedData.labels.forEach(date => {
            const { positive, neutral, negative } = sentimentCountsByDate[date];
            const total = positive + neutral + negative;

            // @ts-ignore
            aggregatedData.positive.push(positive * 100 / total);
            // @ts-ignore
            aggregatedData.neutral.push(neutral * 100 / total);
            // @ts-ignore
            aggregatedData.negative.push(negative * 100 / total * -1);
        });

        return aggregatedData;
    };

    const sentimentData = aggregateSentimentData(individualData);

    const chartData = {
        labels: sentimentData.labels,
        datasets: [
            {
                label: "Neutral",
                data: sentimentData.neutral,
                backgroundColor: "rgb(159,182,178)",
            },
            {
                label: "Negative",
                data: sentimentData.negative,
                backgroundColor: "rgb(232,21,95)",
            },
            {
                label: "Positive",
                data: sentimentData.positive,
                backgroundColor: "rgb(64,230,215)",
            }
        ],
    };

    const options = {
        type: 'bar',
        plugins: {
            title: {
                display: true,
                text: 'Sentiment Trends'
            },
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true
            }
        }
    };

    return <Chart data={chartData} options={options}  type="bar"/>;
};

export default SentimentChart;
