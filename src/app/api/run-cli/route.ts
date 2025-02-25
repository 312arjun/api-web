// app/api/run-cli/route.ts
import { exec } from "child_process";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    console.log("Received action:", action);

    // Validate the action
    if (action !== "connect" && action !== "disconnect") {
      console.error("Invalid action provided:", action);
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Determine the full path to mpp.exe
    const mppPath = path.resolve(process.cwd(), "bin", "mpp.exe");
    console.log("mpp.exe path:", mppPath);

    // Build the command. On Windows, enclose the path in quotes.
    const command = `${mppPath} ${action}`;
    console.log("Executing command:", command);

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Execution error:", error);
          return resolve(
            NextResponse.json({ error: error.message, stderr }, { status: 500 })
          );
        }
        console.log("Execution stdout:", stdout);
        console.log("Execution stderr:", stderr);
        resolve(NextResponse.json({ stdout, stderr }));
      });
    });
  } catch (err) {
    console.error("Error in API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
