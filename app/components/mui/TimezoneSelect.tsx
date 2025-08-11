import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { getTimezoneOptions, Timezone } from '@/app/utils/timezone';

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  label = "Timezone",
  required = false,
  disabled = false,
  fullWidth = true,
  error = false,
  helperText
}) => {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        setLoading(true);
        const timezoneOptions = await getTimezoneOptions();
        setTimezones(timezoneOptions);
      } catch (error) {
        console.error('Failed to fetch timezones:', error);
        setErrorState('Failed to load timezones');
      } finally {
        setLoading(false);
      }
    };

    fetchTimezones();
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  if (loading) {
    return (
      <FormControl fullWidth={fullWidth} disabled>
        <InputLabel>{label}</InputLabel>
        <Select value="" label={label}>
          <MenuItem value="">Loading timezones...</MenuItem>
        </Select>
      </FormControl>
    );
  }

  if (errorState) {
    return (
      <FormControl fullWidth={fullWidth} error>
        <InputLabel>{label}</InputLabel>
        <Select value="" label={label}>
          <MenuItem value="">{errorState}</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl 
      fullWidth={fullWidth} 
      required={required}
      disabled={disabled}
      error={error}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>Select Timezone</em>
        </MenuItem>
        {timezones.map((tz) => (
          <MenuItem key={tz.value} value={tz.value}>
            {tz.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TimezoneSelect; 