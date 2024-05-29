"use client";

import ApiService from "@/services/ApiService";
import { Conversation } from "@/types/Search";
import {
  Button,
  ButtonGroup,
  Select,
  Option,
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

const TranscriptionList: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadTranscriptions = async (page: number) => {
    setLoading(true);
    try {
      console.log(`Loading transcriptions for page: ${page}`); // Debug log
      const { conversations, meta } = await ApiService.getTranscriptions(page);
      setConversations(conversations);
      setTotalPages(meta.page_count); // Assuming the API returns this information
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscriptions(page);
  }, [page]);

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
