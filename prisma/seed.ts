import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const today = dateOffset(0);

const sampleAppointments = [
  // Today - AM
  { calendlyEventId: "sim-001", clientName: "Jean Tremblay", clientEmail: "jean.tremblay@email.com", address: "1200 Rue Sainte-Catherine O, Montréal, QC", latitude: 45.4965, longitude: -73.5734, date: today, period: "AM", routeOrder: 1 },
  { calendlyEventId: "sim-002", clientName: "Marie Lavoie", clientEmail: "marie.lavoie@email.com", address: "3575 Avenue du Parc, Montréal, QC", latitude: 45.5105, longitude: -73.5748, date: today, period: "AM", routeOrder: 2 },
  { calendlyEventId: "sim-003", clientName: "Pierre Gagnon", clientEmail: "pierre.gagnon@email.com", address: "7275 Rue Sherbrooke E, Montréal, QC", latitude: 45.5725, longitude: -73.5152, date: today, period: "AM", routeOrder: 3 },
  { calendlyEventId: "sim-004", clientName: "Sophie Bouchard", clientEmail: "sophie.bouchard@email.com", address: "5000 Rue D'Iberville, Montréal, QC", latitude: 45.5365, longitude: -73.5610, date: today, period: "AM", routeOrder: 4 },
  // Today - PM
  { calendlyEventId: "sim-005", clientName: "Luc Bergeron", clientEmail: "luc.bergeron@email.com", address: "900 Boul René-Lévesque O, Montréal, QC", latitude: 45.4988, longitude: -73.5674, date: today, period: "PM", routeOrder: 1 },
  { calendlyEventId: "sim-006", clientName: "Isabelle Côté", clientEmail: "isabelle.cote@email.com", address: "4700 Rue Saint-Denis, Montréal, QC", latitude: 45.5276, longitude: -73.5805, date: today, period: "PM", routeOrder: 2 },
  { calendlyEventId: "sim-007", clientName: "François Roy", clientEmail: "francois.roy@email.com", address: "6600 Rue Saint-Hubert, Montréal, QC", latitude: 45.5430, longitude: -73.5937, date: today, period: "PM", routeOrder: 3 },

  // Tomorrow
  { calendlyEventId: "sim-008", clientName: "Alain Dubois", clientEmail: "alain.dubois@email.com", address: "150 Rue Notre-Dame E, Montréal, QC", latitude: 45.5079, longitude: -73.5540, date: dateOffset(1), period: "AM", routeOrder: 1 },
  { calendlyEventId: "sim-009", clientName: "Caroline Morin", clientEmail: "caroline.morin@email.com", address: "2020 Rue University, Montréal, QC", latitude: 45.5045, longitude: -73.5730, date: dateOffset(1), period: "AM", routeOrder: 2 },
  { calendlyEventId: "sim-010", clientName: "David Pelletier", clientEmail: "david.pelletier@email.com", address: "1001 Rue Lenoir, Montréal, QC", latitude: 45.4830, longitude: -73.5640, date: dateOffset(1), period: "PM", routeOrder: 1 },

  // Day after tomorrow
  { calendlyEventId: "sim-011", clientName: "Émilie Girard", clientEmail: "emilie.girard@email.com", address: "5555 Avenue de Gaspé, Montréal, QC", latitude: 45.5290, longitude: -73.5980, date: dateOffset(2), period: "AM", routeOrder: 1 },
  { calendlyEventId: "sim-012", clientName: "Hugo Martin", clientEmail: "hugo.martin@email.com", address: "3000 Chemin de la Côte-Sainte-Catherine, Montréal, QC", latitude: 45.5080, longitude: -73.6180, date: dateOffset(2), period: "PM", routeOrder: 1 },
  { calendlyEventId: "sim-013", clientName: "Julie Lefebvre", clientEmail: "julie.lefebvre@email.com", address: "4500 Rue de Rouen, Montréal, QC", latitude: 45.5380, longitude: -73.5560, date: dateOffset(2), period: "PM", routeOrder: 2 },

  // +3 days
  { calendlyEventId: "sim-014", clientName: "Marc Simard", clientEmail: "marc.simard@email.com", address: "8000 Boul Langelier, Montréal, QC", latitude: 45.5820, longitude: -73.5340, date: dateOffset(3), period: "AM", routeOrder: 1 },
  { calendlyEventId: "sim-015", clientName: "Nathalie Fortin", clientEmail: "nathalie.fortin@email.com", address: "1500 Rue Atwater, Montréal, QC", latitude: 45.4830, longitude: -73.5860, date: dateOffset(3), period: "PM", routeOrder: 1 },

  // +5 days
  { calendlyEventId: "sim-016", clientName: "Olivier Gauthier", clientEmail: "olivier.gauthier@email.com", address: "2500 Chemin Remembrance, Montréal, QC", latitude: 45.4980, longitude: -73.5880, date: dateOffset(5), period: "AM", routeOrder: 1 },
  { calendlyEventId: "sim-017", clientName: "Patricia Lemieux", clientEmail: "patricia.lemieux@email.com", address: "3700 Rue Crémazie E, Montréal, QC", latitude: 45.5540, longitude: -73.5840, date: dateOffset(5), period: "AM", routeOrder: 2 },

  // -1 day (yesterday)
  { calendlyEventId: "sim-018", clientName: "René Caron", clientEmail: "rene.caron@email.com", address: "1000 Rue de la Montagne, Montréal, QC", latitude: 45.4960, longitude: -73.5760, date: dateOffset(-1), period: "AM", routeOrder: 1 },
  { calendlyEventId: "sim-019", clientName: "Sylvie Bélanger", clientEmail: "sylvie.belanger@email.com", address: "6000 Rue Hochelaga, Montréal, QC", latitude: 45.5510, longitude: -73.5420, date: dateOffset(-1), period: "PM", routeOrder: 1 },

  // -3 days
  { calendlyEventId: "sim-020", clientName: "Thomas Lepage", clientEmail: "thomas.lepage@email.com", address: "4200 Boul Saint-Laurent, Montréal, QC", latitude: 45.5220, longitude: -73.5810, date: dateOffset(-3), period: "AM", routeOrder: 1 },
];

async function main() {
  await prisma.appointment.deleteMany();

  for (const apt of sampleAppointments) {
    await prisma.appointment.create({ data: apt });
  }

  console.log(`Seeded ${sampleAppointments.length} appointments across multiple days`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
