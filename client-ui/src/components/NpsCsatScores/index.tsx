import { FC } from "react";
import { Box, Heading, Paragraph, Stack } from "@twilio-paste/core";

interface NpsCsatScoresProps {
    nps: number;
    csat: number;
}

const NpsCsatScores: FC<NpsCsatScoresProps> = ({ nps, csat }) => {
    return (
        <Stack orientation="horizontal" spacing="space60">
          <Box padding="space60" backgroundColor="colorBackground" borderRadius="borderRadius20" borderStyle="solid" borderWidth="borderWidth10" borderColor="colorBorder">
            <Heading as="h3" variant="heading30">
              Average NPS Score
            </Heading>
            <Paragraph>{nps.toFixed(2)}</Paragraph>
          </Box>
          <Box padding="space60" backgroundColor="colorBackground" borderRadius="borderRadius20" borderStyle="solid" borderWidth="borderWidth10" borderColor="colorBorder">
            <Heading as="h3" variant="heading30">
              Average CSAT Score
            </Heading>
            <Paragraph>{csat.toFixed(2)}</Paragraph>
          </Box>
        </Stack>
    );
};

export default NpsCsatScores;
