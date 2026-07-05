import {
  Box,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useReportSummary } from "../../api/hooks";
import { popmint, popmag, brandLightGray } from "../../theme";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Box p={4} bg={brandLightGray} borderRadius="lg">
      <Stat>
        <StatLabel color="gray.600">{label}</StatLabel>
        <StatNumber color={popmint}>{value}</StatNumber>
      </Stat>
    </Box>
  );
}

export function AdminReports() {
  const report = useReportSummary();

  return (
    <Skeleton isLoaded={!report.isLoading}>
      {report.data && (
        <>
          <SimpleGrid columns={[2, 4]} spacing={4} mb={8}>
            <SummaryCard label="Total revenue" value={`$${(report.data.totalRevenue / 100).toFixed(2)}`} />
            <SummaryCard label="Students" value={String(report.data.totalStudents)} />
            <SummaryCard label="Teachers" value={String(report.data.totalTeachers)} />
            <SummaryCard label="Curriculums" value={String(report.data.totalCurriculums)} />
          </SimpleGrid>

          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Curriculum</Th>
                <Th isNumeric>Purchases</Th>
                <Th isNumeric>Avg. progress</Th>
              </Tr>
            </Thead>
            <Tbody>
              {report.data.curriculumStats.map((stat) => (
                <Tr key={stat.curriculumId}>
                  <Td>{stat.curriculumTitle}</Td>
                  <Td isNumeric>{stat.purchaseCount}</Td>
                  <Td isNumeric color={stat.averageProgressPercent >= 50 ? popmint : popmag}>
                    {stat.averageProgressPercent}%
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Skeleton>
  );
}
