-- Seed movies
INSERT INTO "movie" ("name", "duration", "release_date")
VALUES
  ('Interstellar', 169, DATE '2014-11-07'),
  ('Inception', 148, DATE '2010-07-16'),
  ('The Dark Knight', 152, DATE '2008-07-18');

-- Seed rooms
INSERT INTO "room" ("number")
VALUES
  (1),
  (2),
  (3);

-- Seed seats (20 for each room)
INSERT INTO "seat" ("room_id", "number")
VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
  (1, 11), (1, 12), (1, 13), (1, 14), (1, 15),
  (1, 16), (1, 17), (1, 18), (1, 19), (1, 20),
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
  (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
  (2, 11), (2, 12), (2, 13), (2, 14), (2, 15),
  (2, 16), (2, 17), (2, 18), (2, 19), (2, 20),
  (3, 1), (3, 2), (3, 3), (3, 4), (3, 5),
  (3, 6), (3, 7), (3, 8), (3, 9), (3, 10),
  (3, 11), (3, 12), (3, 13), (3, 14), (3, 15),
  (3, 16), (3, 17), (3, 18), (3, 19), (3, 20);

-- Seed sessions (10 for each room, rotating movies 1,2,3)
INSERT INTO "session" ("movie_id", "room_id", "session_time")
VALUES
  -- Room 1
  (1, 1, TIMESTAMP '2026-04-12 10:00:00'),
  (2, 1, TIMESTAMP '2026-04-12 13:00:00'),
  (3, 1, TIMESTAMP '2026-04-12 16:00:00'),
  (1, 1, TIMESTAMP '2026-04-12 19:00:00'),
  (2, 1, TIMESTAMP '2026-04-12 22:00:00'),
  (3, 1, TIMESTAMP '2026-04-13 10:00:00'),
  (1, 1, TIMESTAMP '2026-04-13 13:00:00'),
  (2, 1, TIMESTAMP '2026-04-13 16:00:00'),
  (3, 1, TIMESTAMP '2026-04-13 19:00:00'),
  (1, 1, TIMESTAMP '2026-04-13 22:00:00'),

  -- Room 2
  (1, 2, TIMESTAMP '2026-04-14 10:00:00'),
  (2, 2, TIMESTAMP '2026-04-14 13:00:00'),
  (3, 2, TIMESTAMP '2026-04-14 16:00:00'),
  (1, 2, TIMESTAMP '2026-04-14 19:00:00'),
  (2, 2, TIMESTAMP '2026-04-14 22:00:00'),
  (3, 2, TIMESTAMP '2026-04-15 10:00:00'),
  (1, 2, TIMESTAMP '2026-04-15 13:00:00'),
  (2, 2, TIMESTAMP '2026-04-15 16:00:00'),
  (3, 2, TIMESTAMP '2026-04-15 19:00:00'),
  (1, 2, TIMESTAMP '2026-04-15 22:00:00'),

  -- Room 3
  (1, 3, TIMESTAMP '2026-04-16 10:00:00'),
  (2, 3, TIMESTAMP '2026-04-16 13:00:00'),
  (3, 3, TIMESTAMP '2026-04-16 16:00:00'),
  (1, 3, TIMESTAMP '2026-04-16 19:00:00'),
  (2, 3, TIMESTAMP '2026-04-16 22:00:00'),
  (3, 3, TIMESTAMP '2026-04-17 10:00:00'),
  (1, 3, TIMESTAMP '2026-04-17 13:00:00'),
  (2, 3, TIMESTAMP '2026-04-17 16:00:00'),
  (3, 3, TIMESTAMP '2026-04-17 19:00:00'),
  (1, 3, TIMESTAMP '2026-04-17 22:00:00');

-- Seed users
INSERT INTO "users" ("username")
VALUES
  ('eduardo'),
  ('gustavo');

-- Seed orders (3 for each user)
INSERT INTO "orders" ("user_id", "status")
VALUES
  (1, 1),
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 2),
  (2, 3);

-- Seed tickets (5 total)
INSERT INTO "ticket" ("order_id", "session_id", "seat_id")
VALUES
  (1, 1, 1),
  (1, 2, 2),
  (2, 3, 3),
  (4, 11, 21),
  (5, 21, 41);
