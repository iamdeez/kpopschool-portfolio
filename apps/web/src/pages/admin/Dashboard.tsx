import { Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { AdminTeachers } from "./AdminTeachers";
import { AdminCurriculums } from "./AdminCurriculums";
import { AdminEvents } from "./AdminEvents";
import { AdminFaqs } from "./AdminFaqs";

export function Dashboard() {
  return (
    <Box p={8}>
      <Heading size="lg" mb={6}>Admin dashboard</Heading>
      {/* isLazy: unmounts inactive panels — without it, both AdminTeachers'
          and AdminCurriculums' "Category" inputs exist in the DOM at once
          (just visually hidden), which is confusing for a11y tools and
          ambiguous for anything selecting by label/placeholder. */}
      <Tabs isLazy>
        <TabList>
          <Tab>Teachers</Tab>
          <Tab>Curriculum</Tab>
          <Tab>Events</Tab>
          <Tab>FAQ</Tab>
        </TabList>
        <TabPanels>
          <TabPanel><AdminTeachers /></TabPanel>
          <TabPanel><AdminCurriculums /></TabPanel>
          <TabPanel><AdminEvents /></TabPanel>
          <TabPanel><AdminFaqs /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
