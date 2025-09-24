"use client";
import {
  Button,
  Card,
  Container,
  Group,
  List,
  Loader,
  PasswordInput,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { RecordType, SessionType } from "../types/types";

const App: React.FC = () => {
  const [session, setSession] = useState<SessionType | null>(null);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Records form state
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");

  useEffect(() => {
    fetchSession().then((sess) => {
      if (sess) {
        setSession(sess);
        fetchRecords();
      }
    });
  }, []);

  async function fetchSession() {
    const response = await fetch("/api/session", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return null;

    const { session } = await response.json();
    return session;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      alert("Failed to login");
      setLoading(false);
      return;
    }

    const { data } = await response.json();
    setSession(data);
    fetchRecords();
    setLoading(false);
  }

  async function fetchRecords() {
    setLoading(true);
    const response = await fetch(`/api/records`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const { data } = await response.json();
    setRecords(data ?? []);
    setLoading(false);
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !priority) return;

    const response = await fetch(`/api/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, priority }),
    });

    if (!response.ok) {
      alert("Failed to add new record");
      return;
    }

    const newRecord = await response.json();
    setRecords((prev) => [...prev, newRecord]);
    setTitle("");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });

    setSession(null);
    setRecords([]);
    setTitle("");
    setPriority("low");
  }

  // ------------------------
  // Login Form
  // ------------------------
  if (!session) {
    return (
      <Container size="xs" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} mb="md" ta="center">
            Login
          </Title>
          <form onSubmit={handleLogin}>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              mb="sm"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              mb="sm"
            />
            <Group justify="center" mt="md">
              <Button type="submit" loading={loading} fullWidth>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Group>
          </form>
        </Card>
      </Container>
    );
  }

  // ------------------------
  // Records Page
  // ------------------------
  return (
    <Container size="sm" py="xl">
      <Group w="inherit" align="start" justify="space-between">
        <Title order={2} mb="lg">
          Welcome, {session.email}
        </Title>
        <Button variant="light" onClick={handleLogout}>
          Logout
        </Button>
      </Group>

      {/* Record Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <form onSubmit={handleAddRecord}>
          <TextInput
            label="Title"
            placeholder="Enter record title"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
            mb="sm"
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(val) => setPriority(val ?? "low")}
            data={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            mb="sm"
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit">Add Record</Button>
          </Group>
        </form>
      </Card>

      {/* Records List */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Records
        </Title>
        {loading ? (
          <Loader />
        ) : records.length === 0 ? (
          <Text c="dimmed">No records found</Text>
        ) : (
          <List spacing="sm" size="sm" center>
            {records.map((rec) => (
              <List.Item key={rec.id}>
                <Text fw={500}>{rec.title}</Text>
                <Text size="xs" c="dimmed">
                  Priority: {rec.priority} –{" "}
                  {new Date(rec.created_at).toLocaleString()}
                </Text>
              </List.Item>
            ))}
          </List>
        )}
      </Card>
    </Container>
  );
};

export default App;
