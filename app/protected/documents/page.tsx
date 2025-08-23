import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Download, Trash2, Eye } from "lucide-react";

export default function DocumentsPage() {
  const documents = [
    {
      id: 1,
      name: "Project Proposal.pdf",
      type: "PDF",
      size: "2.4 MB",
      lastModified: "2 hours ago",
      status: "Published",
    },
    {
      id: 2,
      name: "User Manual.docx",
      type: "DOCX",
      size: "1.8 MB",
      lastModified: "1 day ago",
      status: "Draft",
    },
    {
      id: 3,
      name: "Financial Report.xlsx",
      type: "XLSX",
      size: "3.2 MB",
      lastModified: "3 days ago",
      status: "Published",
    },
    {
      id: 4,
      name: "Meeting Notes.txt",
      type: "TXT",
      size: "45 KB",
      lastModified: "1 week ago",
      status: "Archived",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and organize your documents.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            Search and manage your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.type} • {doc.size} • {doc.lastModified}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      doc.status === "Published"
                        ? "default"
                        : doc.status === "Draft"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
