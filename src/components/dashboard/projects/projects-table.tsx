'use client';

import * as React from 'react';
// Make sure to import useNavigate
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // do nothing
}

export interface Project {
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  endDate: string;
  startDate: string;
  isRunning: boolean;
  managerName: string;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: Project[];
  rowsPerPage?: number;
}

export function ProjectsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: CustomersTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((project) => project.projectId);
  }, [rows]);
  const router = useRouter(); // Initialize router
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleRowClick = (projectId: string) => {
    router.push(`/dashboard/project/${projectId}`); // Navigate to project details page
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Is Running</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.projectId} onClick={() => handleRowClick(row.projectId)}>
                <TableCell>{row.projectName}</TableCell>
                <TableCell>{row.managerName}</TableCell>
                <TableCell>{dayjs(row.startDate).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{dayjs(row.endDate).format('DD/MM/YYYY')}</TableCell>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={row.isRunning}
                    onChange={(event) => {
                      if (event.target.checked) {
                        selectOne(row.projectId);
                      } else {
                        deselectOne(row.projectId);
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
