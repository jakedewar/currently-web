import { TeamTable } from "@/components/team-table";

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/avatars/john.jpg",
      department: "Design",
      currentWork: "Designing the new user onboarding flow in Figma",
      lastActive: "2 minutes ago",
      location: "San Francisco, CA",
      timezone: "PST",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/avatars/jane.jpg",
      department: "Engineering",
      currentWork: "Code review for the authentication system PR",
      lastActive: "5 minutes ago",
      location: "New York, NY",
      timezone: "EST",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      avatar: "/avatars/bob.jpg",
      department: "Engineering",
      currentWork: "Writing documentation for the API endpoints",
      lastActive: "15 minutes ago",
      location: "Austin, TX",
      timezone: "CST",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice.brown@example.com",
      avatar: "/avatars/alice.jpg",
      department: "Product",
      currentWork: "Planning the Q2 roadmap in Notion",
      lastActive: "1 minute ago",
      location: "Seattle, WA",
      timezone: "PST",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      avatar: "/avatars/charlie.jpg",
      department: "Engineering",
      currentWork: "Debugging the mobile app performance issues",
      lastActive: "2 hours ago",
      location: "Remote",
      timezone: "GMT",
    },
    {
      id: 6,
      name: "Diana Garcia",
      email: "diana.garcia@example.com",
      avatar: "/avatars/diana.jpg",
      department: "Marketing",
      currentWork: "Customer feedback analysis in Google Sheets",
      lastActive: "Just now",
      location: "Miami, FL",
      timezone: "EST",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          See what your teammates are currently working on and stay connected.
        </p>
      </div>

      <TeamTable users={users} />
    </div>
  );
}
