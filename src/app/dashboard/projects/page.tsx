'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { ProjectsTable } from '@/components/dashboard/projects/projects-table';
import type { Project } from '@/components/dashboard/projects/projects-table';

import { addProject, getAllManagers, getAllProjects } from '../../helper/api';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [open, setOpen] = React.useState<boolean>(false);
  const [managers, setManagers] = React.useState<{ id: string; managerName: string }[]>([]);
  const [formData, setFormData] = React.useState({
    projectName: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isRunning: false,
    managerId: '',
  });
  const [showRunningProjects, setShowRunningProjects] = React.useState<boolean>(false);
  const [selectedEndDate, setSelectedEndDate] = React.useState<string>('');

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getAllProjects();
        if (!response) throw new Error('Failed to fetch projects');
        setProjects(response.response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await getAllManagers();
        if (!response) throw new Error('Failed to fetch managers');
        setManagers(response.response.data);
      } catch {
        setError('An unknown error occurred while fetching managers');
      }
    };

    fetchProjects();
    fetchManagers();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: any; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleManagerChange = (event: SelectChangeEvent<string>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      managerId: event.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await addProject(formData);

      if (!response) throw new Error('Failed to add project');
      setOpen(false);
      setFormData({
        projectName: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        isRunning: false,
        managerId: '',
      });
      const updatedProjects = await getAllProjects();
      setProjects(updatedProjects.response.data);
    } catch {
      setError('An error occurred while adding the project');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleToggleRunningProjects = () => {
    setShowRunningProjects((prev) => !prev);

    if (!showRunningProjects) {
      const runningProjects = projects.filter((project) => project.isRunning);
      setProjects(runningProjects);
    } else {
      const fetchAllProjects = async () => {
        try {
          const response = await getAllProjects();
          if (!response) throw new Error('Failed to fetch projects');
          setProjects(response.response.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      };

      fetchAllProjects();
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const endDate = new Date(project.endDate);
      const currentDate = new Date();

      // Check if endDate is valid
      if (isNaN(endDate.getTime())) {
        return false; // Skip invalid date
      }

      const isRunning = project.isRunning && endDate >= currentDate;

      // Check running status based on toggle
      const isProjectRunning = showRunningProjects ? project.isRunning : true;

      // Check end date match if selected
      const isEndDateMatch = selectedEndDate ? endDate.toISOString().split('T')[0] === selectedEndDate : true;

      return isProjectRunning && isEndDateMatch;
    });
  }, [projects, showRunningProjects, selectedEndDate]);

  const paginatedProjects = applyPagination(filteredProjects, page, rowsPerPage);
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto', alignItems: 'center' }}>
          <Typography variant="h4">Projects</Typography>

          {/* Inline Filters */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="outlined" size="small" onClick={handleToggleRunningProjects} sx={{ marginLeft: '0' }}>
              {showRunningProjects ? 'Show All Projects' : 'Show Running Projects'}
            </Button>

            <TextField
              label="Filter by End Date"
              type="date"
              value={selectedEndDate}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '200px' }} // Adjust width as needed
            />
          </Stack>
        </Stack>

        <div>
          <Button onClick={handleOpen} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add Project
          </Button>
        </div>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <ProjectsTable count={filteredProjects.length} page={page} rows={paginatedProjects} rowsPerPage={rowsPerPage} />
      )}

      {/* Modal for Add Project */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Project Name"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth required />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <Select
              label="Manager"
              name="managerId"
              value={formData.managerId}
              onChange={handleManagerChange}
              fullWidth
              required
            >
              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.managerName}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add Project
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function applyPagination(rows: Project[], page: number, rowsPerPage: number): Project[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
