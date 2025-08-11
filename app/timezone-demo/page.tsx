"use client";

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import TimezoneSelect from '@/app/components/TimezoneSelect';
import { getUserTimezone, convertToTimezone, formatTimezoneOffset } from '@/app/utils/timezone';

const TimezoneDemo = () => {
  const [selectedTimezone, setSelectedTimezone] = useState(getUserTimezone());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const convertedTime = convertToTimezone(currentTime, selectedTimezone);

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="mb-4">Timezone Functionality Demo</h1>
          
          <Alert variant="info">
            <strong>Current User Timezone:</strong> {getUserTimezone()}
          </Alert>

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5>Timezone Selection</h5>
                </Card.Header>
                <Card.Body>
                  <TimezoneSelect
                    value={selectedTimezone}
                    onChange={setSelectedTimezone}
                    label="Select Timezone"
                    required
                  />
                  <small className="text-muted">
                    This component fetches timezones from the TimezoneDB API and provides a user-friendly dropdown.
                  </small>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5>Time Conversion</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Current Time (UTC):</strong><br />
                    <code>{currentTime.toISOString()}</code>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Selected Timezone:</strong><br />
                    <code>{selectedTimezone}</code>
                  </div>
                  
                  <div>
                    <strong>Converted Time:</strong><br />
                    <code>{convertedTime.toLocaleString('en-US', { timeZone: selectedTimezone })}</code>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5>API Features</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h6>Timezone Fetching</h6>
                  <ul>
                    <li>Fetches from TimezoneDB API</li>
                    <li>Fallback to common timezones</li>
                    <li>User's timezone highlighted</li>
                    <li>Sorted by GMT offset</li>
                  </ul>
                </Col>
                
                <Col md={4}>
                  <h6>Utility Functions</h6>
                  <ul>
                    <li><code>getUserTimezone()</code> - Get current timezone</li>
                    <li><code>convertToTimezone()</code> - Convert dates</li>
                    <li><code>formatTimezoneOffset()</code> - Format offsets</li>
                    <li><code>getTimezoneOptions()</code> - Get dropdown options</li>
                  </ul>
                </Col>
                
                <Col md={4}>
                  <h6>Components</h6>
                  <ul>
                    <li><code>TimezoneSelect</code> - Bootstrap version</li>
                    <li><code>TimezoneSelect</code> - Material-UI version</li>
                    <li>Loading states</li>
                    <li>Error handling</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5>Usage Examples</h5>
            </Card.Header>
            <Card.Body>
              <h6>Basic Usage:</h6>
              <pre className="bg-light p-3 rounded">
{`import TimezoneSelect from '@/app/components/TimezoneSelect';

<TimezoneSelect
  value={timezone}
  onChange={setTimezone}
  label="Timezone"
  required
/>`}
              </pre>

              <h6>Utility Functions:</h6>
              <pre className="bg-light p-3 rounded">
{`import { getUserTimezone, convertToTimezone } from '@/app/utils/timezone';

const userTz = getUserTimezone();
const convertedDate = convertToTimezone(new Date(), 'America/New_York');`}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TimezoneDemo; 