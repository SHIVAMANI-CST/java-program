
import { TableColumn } from "react-data-table-component";

/**
 * Generic function to filter data based on search text and columns.
 * It checks if the search text exists in ANY of the visible column values for a row.
 *
 * @param data - The array of data to filter.
 * @param searchText - The text to search for.
 * @param columns - The columns definition from react-data-table-component.
 * @returns - The filtered data.
 */
export const filterDataByColumns = <T>(
    data: T[],
    searchText: string,
    columns: TableColumn<T>[]
): T[] => {
    if (!searchText) {
        return data; // Return all data if no search text
    }

    const lowerSearchText = searchText.toLowerCase();

    return data.filter((row) => {
        return columns.some((column) => {
            // We only care about columns that have actionable data to show (selector or cell)
            // But 'selector' is the most reliable way to get the raw value.

            let cellValue: string | number | undefined | null = '';

            if (column.selector) {
                // @ts-ignore - selector is defined as capable of returning primitive
                cellValue = column.selector(row);
            }

            // If selector isn't enough (e.g. custom cell), we might miss it.
            // But for this generic implementation, relying on 'selector' is standard best practice for search.
            // If a column is purely display (like a button), we usually don't want to search it anyway.

            if (cellValue === null || cellValue === undefined) {
                return false;
            }

            return String(cellValue).toLowerCase().includes(lowerSearchText);
        });
    });
};
