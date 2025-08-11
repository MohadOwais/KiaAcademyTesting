import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { getTimezoneOptions, Timezone } from '@/app/utils/timezone';

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  errorMessage?: string;
}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  label = "Timezone",
  required = false,
  disabled = false,
  className = "",
  error = false,
  errorMessage
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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  if (loading) {
    return (
      <Form.Group className={className}>
        <Form.Label>{label}</Form.Label>
        <Form.Select disabled>
          <option value="">Loading timezones...</option>
        </Form.Select>
      </Form.Group>
    );
  }

  if (errorState) {
    return (
      <Form.Group className={className}>
        <Form.Label>{label}</Form.Label>
        <Form.Select isInvalid>
          <option value="">{errorState}</option>
        </Form.Select>
      </Form.Group>
    );
  }

  return (
    <Form.Group className={className}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        isInvalid={error}
      >
        <option value="">Select Timezone</option>
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </Form.Select>
      {error && errorMessage && (
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default TimezoneSelect; 