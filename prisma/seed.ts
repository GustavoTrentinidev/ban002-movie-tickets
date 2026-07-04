import { prisma } from "@/core/infrastructure/database/prisma/client";
import { repositoryFactory } from "@/core/infrastructure/repositories/factory/repository-factory";

async function main() {
  const existingMovie = await prisma.movie.findFirst();
  if (existingMovie) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  const movieRepo = repositoryFactory.movie();
  const roomRepo = repositoryFactory.room();
  const sessionRepo = repositoryFactory.session();
  const userRepo = repositoryFactory.user();
  const orderRepo = repositoryFactory.order();

  console.log("Seeding movies...");
  const interstellar = await movieRepo.create({
    name: "Interstellar",
    duration: 169,
    releaseDate: new Date("2014-11-07"),
  });
  const inception = await movieRepo.create({
    name: "Inception",
    duration: 148,
    releaseDate: new Date("2010-07-16"),
  });
  const darkKnight = await movieRepo.create({
    name: "The Dark Knight",
    duration: 152,
    releaseDate: new Date("2008-07-18"),
  });
  const movies = [interstellar, inception, darkKnight];

  console.log("Seeding rooms with 20 seats each...");
  const room1 = await roomRepo.createWithSeats({ number: 1, seatsCount: 20 });
  const room2 = await roomRepo.createWithSeats({ number: 2, seatsCount: 20 });
  const room3 = await roomRepo.createWithSeats({ number: 3, seatsCount: 20 });
  const rooms = [room1, room2, room3];

  console.log("Seeding sessions...");
  const sessionTimesByDay = [
    "10:00:00",
    "13:00:00",
    "16:00:00",
    "19:00:00",
    "22:00:00",
  ];
  const sessions = [];
  for (let roomIndex = 0; roomIndex < rooms.length; roomIndex += 1) {
    const room = rooms[roomIndex].room;
    const baseDay = 12 + roomIndex * 2;
    for (let slot = 0; slot < 10; slot += 1) {
      const dayOffset = Math.floor(slot / sessionTimesByDay.length);
      const time = sessionTimesByDay[slot % sessionTimesByDay.length];
      const day = String(baseDay + dayOffset).padStart(2, "0");
      const movie = movies[slot % movies.length];
      const session = await sessionRepo.create({
        movieId: movie.id,
        roomId: room.id,
        sessionTime: new Date(`2026-04-${day}T${time}`),
      });
      sessions.push(session);
    }
  }

  console.log("Seeding demo users...");
  const eduardo = await userRepo.create({
    username: "eduardo",
    // Demo password (change in any non-local environment): "eduardo123"
    passwordHash: "$2b$10$BIbVdcT8zmx3vySrCPlfe.2AsRDuD7AhsnMbC5/cbqS5N0xoN.bFu",
    role: "DEFAULT",
  });
  const gustavo = await userRepo.create({
    username: "gustavo",
    // Demo password (change in any non-local environment): "gustavo123"
    passwordHash: "$2b$10$G0NTeiVqJuG5Xr83665pAekU9B1P96Kje///9eYU.e5bTzQ3JhF4K",
    role: "ADMIN",
  });

  console.log("Seeding demo orders and tickets...");
  const room1Seats = rooms[0].seats;
  const room2Seats = rooms[1].seats;
  const room3Seats = rooms[2].seats;

  await orderRepo.createWithTickets({
    userId: eduardo.id,
    status: 1,
    sessionId: sessions[0].id,
    seatIds: [room1Seats[0].id, room1Seats[1].id],
  });
  await orderRepo.createWithTickets({
    userId: eduardo.id,
    status: 1,
    sessionId: sessions[2].id,
    seatIds: [room1Seats[2].id],
  });
  await orderRepo.createWithTickets({
    userId: eduardo.id,
    status: 2,
    sessionId: sessions[0].id,
    seatIds: [],
  });
  await orderRepo.createWithTickets({
    userId: gustavo.id,
    status: 1,
    sessionId: sessions[10].id,
    seatIds: [room2Seats[0].id],
  });
  await orderRepo.createWithTickets({
    userId: gustavo.id,
    status: 2,
    sessionId: sessions[20].id,
    seatIds: [room3Seats[0].id],
  });
  await orderRepo.createWithTickets({
    userId: gustavo.id,
    status: 3,
    sessionId: sessions[20].id,
    seatIds: [],
  });

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
