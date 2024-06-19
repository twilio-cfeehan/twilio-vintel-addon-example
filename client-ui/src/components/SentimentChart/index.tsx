import {FC, MouseEvent, useRef, useState} from "react";
import {Bar, Chart, getDatasetAtEvent, getElementAtEvent} from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend, InteractionItem,
} from "chart.js";
import MainTabs from "@/components/MainTabs";

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
    const [tab, setTab] = useState("SentimentChart");
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
    const chartRef = useRef<ChartJS>(null);
    const onClick = (event: MouseEvent) => {
        const { current: chart } = chartRef;

        if (!chart) {
            return;
        }

        // @ts-ignore
        const contextDataset : number | undefined = getDataset(getDatasetAtEvent(chart, event));

        const currentUrl = window.location.href;
        const newParams = { filter: "sentiment" , contextDataset: contextDataset};
        // @ts-ignore
        const newUrl = setQueryParams(currentUrl, newParams);
        window.location.href = newUrl;
        setTab('tab-transcriptions');
    };

    const setQueryParams = (url: string, params: { contextDataset: string | undefined; contextDate: string | undefined }) => {
        const urlObj = new URL(url);
        const urlParams = new URLSearchParams(urlObj.search);

        Object.entries(params).forEach(([key, value]) => {
            if (!value) {
                return;
            }
            urlParams.set(key, value.toString());
        });

        urlObj.search = urlParams.toString();

        return urlObj.toString();
    };

    const getDataset = (dataset: InteractionItem[]) => {
        if (!dataset.length) return;
        const datasetIndex = dataset[0].datasetIndex;
        return chartData.datasets[datasetIndex].label;
    };

    return <Chart ref={chartRef} data={chartData} options={options}  type="bar" onClick={onClick}/>;
};

export default SentimentChart;

