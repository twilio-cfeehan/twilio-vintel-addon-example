import { FC, useEffect, useState } from "react";
import { Box, Card, Heading, Stack } from "@twilio-paste/core";
import { Callout, CalloutHeading, CalloutText } from "@twilio-paste/core";
import ApiService from "@/services/ApiService";
import SentimentChart from "../SentimentChart";
import BusinessOutcomesChart from "../BusinessOutcomesChart";
import NpsCsatScores from "../NpsCsatScores";
import OperatorUsageChart from "../OperatorUsageChart";
import { OperatorResult } from "../../types/OperatorResult";

interface AggregatedData {
    average_nps_score: number;
    average_csat_score: number;
    sentiment_summary: string;
    business_outcome_summary: string;
}

const AggregatedView: FC = () => {
    const [loading, setLoading] = useState(true);
    const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
    const [individualData, setIndividualData] = useState<any[]>([]);
    const [operatorResults, setOperatorResults] = useState<OperatorResult[]>([]);

    useEffect(() => {
        const fetchAggregatedData = async () => {
            try {
                const data = await ApiService.getAggregatedAnalysis();
                setAggregatedData(data);
            } catch (error) {
                console.error("Error fetching aggregated data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAggregatedData();
    }, []);

    useEffect(() => {
        const fetchIndividualData = async () => {
            try {
                const data = await ApiService.getIndividualAnalyses();
                setIndividualData(data);

                const operatorResultsPromises = data.map((item: any) =>
                    ApiService.getOperatorResults(item.transcription_sid)
                );
                const operatorResultsData = await Promise.all(operatorResultsPromises);

                console.log("Operator Results Data:", operatorResultsData);

                // Flatten the array of arrays to a single array
                const flattenedOperatorResults = operatorResultsData.flat();
                setOperatorResults(flattenedOperatorResults);
            } catch (error) {
                console.error("Error fetching individual data:", error);
            }
        };

        fetchIndividualData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!aggregatedData) {
        return <div>No data available</div>;
    }

    return (
        <Box padding="space60">
            <Heading as="h1" variant="heading10">
                Aggregated Analysis
            </Heading>

            <Stack orientation="vertical" spacing="space60">
                <Callout variant="neutral">
                    <CalloutHeading as="h2">
                        Aggregated Insights Summary
                    </CalloutHeading>
                    <CalloutText>
                        <Heading as="h3" variant="heading30">
                            Sentiment Trends
                        </Heading>
                        <Box marginBottom="space40">
                            {aggregatedData.sentiment_summary}
                        </Box>
                        <Heading as="h3" variant="heading30">
                            Business Outcomes
                        </Heading>
                        <Box>
                            {aggregatedData.business_outcome_summary}
                        </Box>
                    </CalloutText>
                </Callout>

                <Card padding="space60">
                    <Heading as="h2" variant="heading20">
                        Sentiment Trends
                    </Heading>
                    <SentimentChart individualData={individualData} />
                </Card>

                <Card padding="space60">
                    <Heading as="h2" variant="heading20">
                        Common Business Outcomes
                    </Heading>
                    <BusinessOutcomesChart individualData={individualData} />
                </Card>

                <Card padding="space60">
                    <Heading as="h2" variant="heading20">
                        NPS and CSAT Scores
                    </Heading>
                    <NpsCsatScores nps={aggregatedData.average_nps_score} csat={aggregatedData.average_csat_score} />
                </Card>

                <Card padding="space60">
                    <Heading as="h2" variant="heading20">
                        Operator Usage
                    </Heading>
                    <OperatorUsageChart operatorResults={operatorResults} />
                </Card>
            </Stack>
        </Box>
    );
};

export default AggregatedView;
