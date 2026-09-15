import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getDashboardData } from "@/lib/dashboard-data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await getDashboardData();
  return NextResponse.json(data);
}
