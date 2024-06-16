import {FC, useEffect} from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { OperatorResult } from "../../types/OperatorResult";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

interface OperatorUsageChartProps {
    operatorResults: OperatorResult[];
}

// @ts-ignore
const OperatorUsageChart: FC<OperatorUsageChartProps> = ({ operatorResults }) => {
    const operatorNames = ["Prod_CallDisposition", "Password Reset", "Unavailable-Party", "Voicemail Detector", "Entity Recognition", "Lead generation"];

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {operatorNames.map(name => {
              const resultsForName = operatorResults.filter(result => result.name === name);
              const operatorCounts = resultsForName.reduce((acc: Record<string, number>, result) => {
                  if (result.name == "Lead generation" || result.name == "Entity Recognition" || result.name == "RecordingDisclosureOperator") {
                      const keys = result.extract_results ? [...Object.keys(result.extract_results), "No Class"] : ["No Class"];
                      for (const i in keys){
                          acc[keys[i]] = (acc[keys[i]] || 0) + 1;
                      }
                  }
                  else {
                      const label = result.predicted_label;
                      acc[label] = (acc[label] || 0) + 1;
                  }
                  return acc;
              }, {});


              const sentimentAnalysisResults = operatorResults.filter(result => result.name === "Sentiment Analysis");
              const sentimentMap = sentimentAnalysisResults.reduce((acc: Record<string, string[]>, result) => {
                  if (!acc[result.predicted_label]) {
                      acc[result.predicted_label] = [];
                  }
                  acc[result.predicted_label].push(result.transcript_sid);
                  return acc;
              }, {});

              localStorage.setItem('OperatorResults#SentimentMap', JSON.stringify(sentimentMap));

              const sortedOperators = Object.entries(operatorCounts).sort(([, a], [, b]) => b - a);

              const chartData = {
                  labels: sortedOperators.map(([label]) => label),
                  datasets: [
                      {
                          label: `${name} Usage`,
                          data: sortedOperators.map(([, count]) => count),
                          backgroundColor: [
                              'rgba(255, 99, 132, 0.2)',
                              'rgba(54, 162, 235, 0.2)',
                              'rgba(255, 206, 86, 0.2)',
                              'rgba(75, 192, 192, 0.2)',
                              'rgba(153, 102, 255, 0.2)',
                              'rgba(255, 159, 64, 0.2)'
                          ],
                          borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                              'rgba(255, 159, 64, 1)'
                          ],
                          borderWidth: 1,
                      },
                  ],
              };

              const options = {
                  responsive: true,
                  aspectRatio: 1,
                  plugins: {
                      legend: {
                          display: true,
                          position: "top" as const,
                      },
                      title: {
                          display: true,
                          text: `${name}`,
                      },
                  },
              };

              return (
                <div style={{ flex: '1 0 200px', margin: '10px' }} key={name}>
                    <Doughnut key={name} data={chartData} options={options} />
                </div>
              );
          })}
      </div>
    );
};

export default OperatorUsageChart;
