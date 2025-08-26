import { NextRequest, NextResponse } from "next/server";
import { getUserStreams } from "@/lib/data/streams";
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
      const streamsData = await getUserStreams(id, organizationId);
      return NextResponse.json(streamsData);
    } catch (streamsError) {
      console.error("Error fetching user streams:", streamsError);
      return NextResponse.json(
        { error: streamsError instanceof Error ? streamsError.message : "Failed to fetch user streams" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in user streams route:", error);
    return NextResponse.json(
      { error: "Failed to fetch user streams" },
      { status: 500 }
    );
  }
}
