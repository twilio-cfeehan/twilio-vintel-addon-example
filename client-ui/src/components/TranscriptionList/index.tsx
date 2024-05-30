"use client";

import ApiService from "@/services/ApiService";
import { Conversation } from "@/types/Search";
import {
  Button,
  Select,
  Option,
  Box,
  SkeletonLoader,
  Stack,
  TBody,
  THead,
  Table,
  Td,
  Tr,
} from "@twilio-paste/core";
import { FC, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DefaultFilterGroup } from "../DefaultFilterGroup";

const TranscriptionList: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState<string>("");

  const loadTranscriptions = async (page: number, searchValue: string, filterFrom: string) => {
    setLoading(true);
    try {
      console.log(`Loading transcriptions for page: ${page} with searchValue: ${searchValue} and filterFrom: ${filterFrom}`); // Debug log
      const { conversations, meta } = await ApiService.getTranscriptions(page, searchValue, filterFrom);
      setConversations(conversations || []);
      setTotalPages(meta?.page_count || 1); // Assuming the API returns this information
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscriptions(page, searchValue, filterFrom);
  }, [page, searchValue, filterFrom]);

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPage = Number(e.target.value);
    setPage(newPage);
    router.push(`?page=${newPage}`);
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      setPage(nextPage);
      router.push(`?page=${nextPage}`);
    }
  };

  const handlePreviousPage = () => {
    const prevPage = page - 1;
    if (prevPage >= 1) {
      setPage(prevPage);
      router.push(`?page=${prevPage}`);
    }
  };

  const handleApplyFilters = (searchValue: string, filterFrom: string) => {
    setSearchValue(searchValue);
    setFilterFrom(filterFrom);
    loadTranscriptions(page, searchValue, filterFrom);
  };

  const handleClearAll = () => {
    setSearchValue("");
    setFilterFrom("");
    loadTranscriptions(page, "", "");
  };

  const convertToCSV = (data: any[]) => {
    const header = ["Created", "SID", "From", "To"];
    const rows = data.map(row => [
      row.date_created,
      row.sid,
      row.from_number,
      row.to_number
    ].join(","));
    return [header.join(","), ...rows].join("\n");
  };

  const handleExportCSV = async () => {
    try {
      const allConversations = await ApiService.getAllTranscriptions();
      const csv = convertToCSV(allConversations);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'transcriptions.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading)
    return (
      <Stack orientation="vertical" spacing="space80">
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </Stack>
    );

  return (
    <>
      <DefaultFilterGroup
        defaultFrom={filterFrom}
        defaultSearchValue={searchValue}
        onApplyFilters={handleApplyFilters}
        onClearAll={handleClearAll}
        onExportCSV={handleExportCSV}
      />
      <Table>
        <THead>
          <Tr>
            <Td>Created</Td>
            <Td>SID</Td>
            <Td>From</Td>
            <Td>To</Td>
            <Td>Actions</Td>
          </Tr>
        </THead>
        <TBody>
          {conversations.map((c) => (
            <Tr key={c.sid}>
              <Td>{c.date_created.toLocaleString()}</Td>
              <Td>{c.sid}</Td>
              <Td>{c.from_number}</Td>
              <Td>{c.to_number}</Td>
              <Td>
                <Button
                  variant="link"
                  size="small"
                  onClick={() =>
                    router.push(`/analysis?transcriptionSid=${c.sid}`)
                  }
                >
                  View Analysis
                </Button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
      <Stack orientation="horizontal" spacing="space40">
        <Button variant="primary" onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </Button>
        <Select value={page.toString()} onChange={handlePageChange}>
          {Array.from({ length: totalPages }, (_, i) => (
            <Option key={i + 1} value={(i + 1).toString()}>
              {i + 1}
            </Option>
          ))}
        </Select>
        <Button variant="primary" onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </Button>
      </Stack>
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        Total Pages: {totalPages}
      </div>
    </>
  );
};

export default TranscriptionList;
