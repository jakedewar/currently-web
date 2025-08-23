import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, FileText, Users, Calendar, Settings } from "lucide-react";

export default function SearchPage() {
  const searchResults = [
    {
      id: 1,
      title: "Project Documentation",
      type: "Document",
      category: "Files",
      description: "Complete project documentation and user guides",
      icon: FileText,
      tags: ["documentation", "guide", "project"],
    },
    {
      id: 2,
      title: "John Doe",
      type: "User",
      category: "People",
      description: "Administrator with full system access",
      icon: Users,
      tags: ["admin", "user", "management"],
    },
    {
      id: 3,
      title: "Team Meeting",
      type: "Event",
      category: "Calendar",
      description: "Weekly team meeting scheduled for tomorrow",
      icon: Calendar,
      tags: ["meeting", "team", "weekly"],
    },
    {
      id: 4,
      title: "System Settings",
      type: "Configuration",
      category: "Settings",
      description: "Application configuration and preferences",
      icon: Settings,
      tags: ["settings", "config", "preferences"],
    },
  ];

  const filters = [
    { label: "All", count: 156 },
    { label: "Documents", count: 45 },
    { label: "Users", count: 23 },
    { label: "Events", count: 12 },
    { label: "Settings", count: 8 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search across all your data and content.
        </p>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for anything..."
              className="pl-10 pr-4 h-12 text-lg"
            />
            <Button className="absolute right-2 top-2 h-8">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button key={filter.label} variant="outline" size="sm">
                {filter.label}
                <Badge variant="secondary" className="ml-2">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            Found {searchResults.length} results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 mt-1">
                  <result.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{result.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{result.category}</Badge>
                        <Badge variant="secondary">{result.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
