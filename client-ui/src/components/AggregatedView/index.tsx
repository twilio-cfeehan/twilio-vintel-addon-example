import { FC, useEffect, useState } from "react";
import { Box, Card, Heading, Paragraph, Stack, Text } from "@twilio-paste/core";
import { InformationIcon } from "@twilio-paste/icons/esm/InformationIcon";
import ApiService from "@/services/ApiService";
import SentimentChart from "../SentimentChart";
import BusinessOutcomesChart from "../BusinessOutcomesChart";
import NpsCsatScores from "../NpsCsatScores";

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
                <Card padding="space60">
                    <Heading as="h2" variant="heading20">
                        Aggregated Insights Summary
                    </Heading>
                    <Box display="flex" alignItems="center" columnGap="space40">
                        <InformationIcon decorative={false} title="Info" size="sizeIcon70" />
                        <Box>
                            <Text as="p" fontWeight="fontWeightBold">
                                Sentiment Trends
                            </Text>
                            <Paragraph>{aggregatedData.sentiment_summary}</Paragraph>
                            <Text as="p" fontWeight="fontWeightBold">
                                Business Outcomes
                            </Text>
                            <Paragraph>{aggregatedData.business_outcome_summary}</Paragraph>
                        </Box>
                    </Box>
                </Card>

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
            </Stack>
        </Box>
    );
};

export default AggregatedView;
