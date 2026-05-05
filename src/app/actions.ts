"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function submitRSVP(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const status = formData.get("status") as string || "confirmado";

  if (!nombre) {
    return { error: "El nombre es obligatorio" };
  }

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS invitados (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        status TEXT DEFAULT 'confirmado',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert guest
    await sql`
      INSERT INTO invitados (nombre, status)
      VALUES (${nombre}, ${status});
    `;

    revalidatePath("/lista");
    return { success: true };
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return { success: false, dbError: true };
  }
}

export async function getGuests() {
  try {
    // Ensure table exists even if list is accessed first
    await sql`
      CREATE TABLE IF NOT EXISTS invitados (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        status TEXT DEFAULT 'confirmado',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const { rows } = await sql`SELECT * FROM invitados ORDER BY fecha DESC`;
    return { guests: rows };
  } catch (error: any) {
    console.error("Error fetching guests:", error);
    return { guests: [], error: error.message || "Unknown DB Error" };
  }
}
