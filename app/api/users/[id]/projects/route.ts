import { NextRequest, NextResponse } from "next/server";
import { getUserProjects } from "@/lib/data/projects";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify the user exists and belongs to the organization
    const supabase = await createClient();
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("user_id", id)
      .eq("organization_id", organizationId)
      .single();

    if (!orgMember) {
      return NextResponse.json(
        { error: "User not found in organization" },
        { status: 404 }
      );
    }

    try {
      const projectsData = await getUserProjects(id, organizationId);
      return NextResponse.json(projectsData);
    } catch (projectsError) {
      console.error("Error fetching user projects:", projectsError);
      return NextResponse.json(
        { error: projectsError instanceof Error ? projectsError.message : "Failed to fetch user projects" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in user projects route:", error);
    return NextResponse.json(
      { error: "Failed to fetch user projects" },
      { status: 500 }
    );
  }
}
