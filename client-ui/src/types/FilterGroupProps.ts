export interface FilterGroupProps {
    defaultFrom?: string;
    defaultSearchValue?: string;
    onApplyFilters: (searchValue: string, filterFrom: string) => void;
    onClearAll: () => void;
    onExportCSV: () => void;
}
