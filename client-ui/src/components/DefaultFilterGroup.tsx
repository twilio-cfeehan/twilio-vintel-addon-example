import * as React from "react";
import { useUID } from "@twilio-paste/uid-library";
import { Box } from "@twilio-paste/box";
import { Button } from "@twilio-paste/button";
import { Input } from "@twilio-paste/input";
import { Label } from "@twilio-paste/label";
import { Separator } from "@twilio-paste/separator";
import { FilterIcon } from "@twilio-paste/icons/esm/FilterIcon";
import { SearchIcon } from "@twilio-paste/icons/esm/SearchIcon";
import { ExportIcon } from "@twilio-paste/icons/esm/ExportIcon";

import type { FilterGroupProps } from "../types/FilterGroupProps";

export const DefaultFilterGroup: React.FC<FilterGroupProps> = ({
    defaultFrom,
    defaultSearchValue,
    onApplyFilters,
    onClearAll,
    onExportCSV,
}) => {
    const fromFilterId = useUID();
    const searchFilterId = useUID();

    const [searchValue, setSearchValue] = React.useState(defaultSearchValue || "");
    const [filterFrom, setFilterFrom] = React.useState(defaultFrom || "");
    const [areButtonsDisabled, setAreButtonsDisabled] = React.useState(
        !(defaultFrom || defaultSearchValue)
    );

    const handleApplyFilters = (): void => {
        onApplyFilters(searchValue, filterFrom);
    };

    const handleClearAll = (): void => {
        setFilterFrom("");
        setSearchValue("");
        onClearAll();
        setAreButtonsDisabled(true);
    };

    React.useEffect(() => {
        setAreButtonsDisabled(filterFrom === "" && searchValue === "");
    }, [filterFrom, searchValue]);

    return (
        <Box paddingBottom="space70">
            <Box display="flex" alignItems="flex-end" columnGap="space50">
                <Box>
                    <Label htmlFor={fromFilterId}>From</Label>
                    <Input
                        id={fromFilterId}
                        type="text"
                        placeholder="Filter by From"
                        value={filterFrom}
                        onChange={(e) => setFilterFrom(e.target.value)}
                    />
                </Box>
                <Box display="flex" columnGap="space50" paddingLeft="space40">
                    <Button
                        variant="primary"
                        aria-label="Apply filters"
                        disabled={areButtonsDisabled}
                        onClick={handleApplyFilters}
                    >
                        <FilterIcon decorative />
                        Apply
                    </Button>
                    <Button variant="link" disabled={areButtonsDisabled} onClick={handleClearAll}>
                        Clear all
                    </Button>
                </Box>
            </Box>
            <Box paddingY="space50">
                <Separator orientation="horizontal" />
            </Box>
            <Box display="flex" justifyContent="space-between">
                <Box
                    width="size40"
                    as="form"
                    onSubmit={(event: React.SyntheticEvent) => {
                        event.preventDefault();
                        handleApplyFilters();
                    }}
                >
                    <Input
                        aria-label="Search"
                        id={searchFilterId}
                        type="text"
                        placeholder="Search by SID"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        insertAfter={
                            <Button variant="link" onClick={handleApplyFilters}>
                                <SearchIcon decorative={false} title="Search" />
                            </Button>
                        }
                    />
                </Box>
                <Button variant="secondary" onClick={onExportCSV}>
                    <ExportIcon decorative />
                    Export CSV
                </Button>
            </Box>
        </Box>
    );
};
