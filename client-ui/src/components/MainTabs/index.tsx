import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useTabState,
} from "@twilio-paste/core";
import TranscriptionList from "../TranscriptionList";
import AggregatedView from "../AggregatedView";
import { FC } from "react";

const useMyTabState = () => {
  const tab = useTabState();
  return {
    ...tab,
    baseId: "layout",
  };
};

export type MainTabsProps = {};

const MainTabs: FC<MainTabsProps> = (props) => {
  const tabState = useMyTabState();

  return (
    <Tabs state={tabState}>
      <TabList aria-label="Call and transcription list">
        <Tab id={"tab-transcriptions"}>Transcripts</Tab>
        <Tab id={"tab-aggregated"}>Aggregated View</Tab>
      </TabList>
      <TabPanels>
        <TabPanel tabId={"tab-transcriptions"}>
          <TranscriptionList />
        </TabPanel>
        <TabPanel tabId={"tab-aggregated"}>
          <AggregatedView />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default MainTabs;
