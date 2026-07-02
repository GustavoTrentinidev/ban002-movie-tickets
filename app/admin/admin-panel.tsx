"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Movie = {
  id: number;
  name: string;
  duration: number | null;
  releaseDate: string | null;
};

type User = {
  id: number;
  username: string;
  role: "ADMIN" | "DEFAULT";
};

type Room = {
  id: number;
  number: number;
};

type Seat = {
  id: number;
  roomId: number;
  number: number;
};

type Session = {
  id: number;
  movieId: number;
  roomId: number;
  sessionTime: string;
};

type ManagedResource = "users" | "movies" | "sessions" | "rooms" | "seats";

type FeedbackState = {
  users: string;
  movies: string;
  sessions: string;
  rooms: string;
  seats: string;
};

async function parseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  return body?.message ?? "Erro inesperado ao processar a requisicao.";
}

function toDateInputValue(rawDate: string | null): string {
  if (!rawDate) {
    return "";
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDisplayDate(rawDate: string | null): string {
  if (!rawDate) {
    return "Nao informado";
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(parsed);
}

function toDateTimeInputValue(rawDateTime: string | null): string {
  if (!rawDateTime) {
    return "";
  }

  const parsed = new Date(rawDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hour = String(parsed.getHours()).padStart(2, "0");
  const minute = String(parsed.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDisplayDateTime(rawDateTime: string): string {
  const parsed = new Date(rawDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  const [success, setSuccess] = useState<FeedbackState>({
    users: "",
    movies: "",
    sessions: "",
    rooms: "",
    seats: "",
  });
  const [errors, setErrors] = useState<FeedbackState>({
    users: "",
    movies: "",
    sessions: "",
    rooms: "",
    seats: "",
  });

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "DEFAULT" as "ADMIN" | "DEFAULT",
  });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userSubmitting, setUserSubmitting] = useState(false);

  const [movieForm, setMovieForm] = useState({
    name: "",
    duration: "",
    releaseDate: "",
  });
  const [editingMovieId, setEditingMovieId] = useState<number | null>(null);
  const [movieSubmitting, setMovieSubmitting] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    movieId: "",
    roomId: "",
    sessionTime: "",
  });
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [sessionSubmitting, setSessionSubmitting] = useState(false);

  const [roomForm, setRoomForm] = useState({
    number: "",
    seatsCount: "",
  });
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [roomSubmitting, setRoomSubmitting] = useState(false);

  const [seatForm, setSeatForm] = useState({
    roomId: "",
    number: "",
  });
  const [editingSeatId, setEditingSeatId] = useState<number | null>(null);
  const [seatSubmitting, setSeatSubmitting] = useState(false);

  const moviesById = useMemo(() => new Map(movies.map((movie) => [movie.id, movie])), [movies]);
  const roomsById = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);

  const reloadAll = useCallback(async (): Promise<void> => {
    setLoading(true);
    setRequestError("");

    try {
      const [usersResponse, moviesResponse, sessionsResponse, roomsResponse, seatsResponse] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/movies", { cache: "no-store" }),
        fetch("/api/sessions", { cache: "no-store" }),
        fetch("/api/rooms", { cache: "no-store" }),
        fetch("/api/seats", { cache: "no-store" }),
      ]);

      if (!usersResponse.ok) {
        throw new Error(await parseError(usersResponse));
      }

      if (!moviesResponse.ok) {
        throw new Error(await parseError(moviesResponse));
      }

      if (!sessionsResponse.ok) {
        throw new Error(await parseError(sessionsResponse));
      }

      if (!roomsResponse.ok) {
        throw new Error(await parseError(roomsResponse));
      }

      if (!seatsResponse.ok) {
        throw new Error(await parseError(seatsResponse));
      }

      const [usersData, moviesData, sessionsData, roomsData, seatsData] = (await Promise.all([
        usersResponse.json(),
        moviesResponse.json(),
        sessionsResponse.json(),
        roomsResponse.json(),
        seatsResponse.json(),
      ])) as [User[], Movie[], Session[], Room[], Seat[]];

      setUsers(usersData);
      setMovies(moviesData);
      setSessions(sessionsData);
      setRooms(roomsData);
      setSeats(seatsData);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Falha ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  function clearFeedback(resource: ManagedResource): void {
    setSuccess((state) => ({ ...state, [resource]: "" }));
    setErrors((state) => ({ ...state, [resource]: "" }));
  }

  function setSuccessMessage(resource: ManagedResource, message: string): void {
    setSuccess((state) => ({ ...state, [resource]: message }));
    setErrors((state) => ({ ...state, [resource]: "" }));
  }

  function setErrorMessage(resource: ManagedResource, message: string): void {
    setErrors((state) => ({ ...state, [resource]: message }));
    setSuccess((state) => ({ ...state, [resource]: "" }));
  }

  function resetMovieForm(): void {
    setMovieForm({ name: "", duration: "", releaseDate: "" });
    setEditingMovieId(null);
  }

  function resetUserForm(): void {
    setUserForm({ username: "", password: "", role: "DEFAULT" });
    setEditingUserId(null);
  }

  function resetRoomForm(): void {
    setRoomForm({ number: "", seatsCount: "" });
    setEditingRoomId(null);
  }

  function resetSessionForm(): void {
    setSessionForm({ movieId: "", roomId: "", sessionTime: "" });
    setEditingSessionId(null);
  }

  function resetSeatForm(): void {
    setSeatForm({ roomId: "", number: "" });
    setEditingSeatId(null);
  }

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    clearFeedback("users");
    setUserSubmitting(true);

    try {
      const trimmedPassword = userForm.password.trim();
      const payload =
        editingUserId === null
          ? {
              username: userForm.username,
              password: trimmedPassword,
              role: userForm.role,
            }
          : {
              username: userForm.username,
              role: userForm.role,
              ...(trimmedPassword === "" ? {} : { password: trimmedPassword }),
            };

      const response = await fetch(editingUserId === null ? "/api/users" : `/api/users/${editingUserId}`, {
        method: editingUserId === null ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage(
        "users",
        editingUserId === null ? "Usuario criado com sucesso." : "Usuario atualizado com sucesso."
      );
      resetUserForm();
    } catch (error) {
      setErrorMessage("users", error instanceof Error ? error.message : "Falha ao salvar usuario.");
    } finally {
      setUserSubmitting(false);
    }
  }

  function startUserEdit(user: User): void {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username,
      password: "",
      role: user.role,
    });
    clearFeedback("users");
  }

  async function deleteUser(userId: number): Promise<void> {
    if (!window.confirm("Deseja remover este usuario?")) {
      return;
    }

    clearFeedback("users");

    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage("users", "Usuario removido com sucesso.");
      if (editingUserId === userId) {
        resetUserForm();
      }
    } catch (error) {
      setErrorMessage("users", error instanceof Error ? error.message : "Falha ao remover usuario.");
    }
  }

  async function handleMovieSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    clearFeedback("movies");
    setMovieSubmitting(true);

    try {
      const durationValue = movieForm.duration.trim();
      const releaseDateValue = movieForm.releaseDate.trim();
      const payload = {
        name: movieForm.name,
        duration: durationValue === "" ? null : Number(durationValue),
        releaseDate: releaseDateValue === "" ? null : releaseDateValue,
      };

      const response = await fetch(
        editingMovieId === null ? "/api/movies" : `/api/movies/${editingMovieId}`,
        {
          method: editingMovieId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage(
        "movies",
        editingMovieId === null ? "Filme criado com sucesso." : "Filme atualizado com sucesso."
      );
      resetMovieForm();
    } catch (error) {
      setErrorMessage("movies", error instanceof Error ? error.message : "Falha ao salvar filme.");
    } finally {
      setMovieSubmitting(false);
    }
  }

  function startMovieEdit(movie: Movie): void {
    setEditingMovieId(movie.id);
    setMovieForm({
      name: movie.name,
      duration: movie.duration === null ? "" : String(movie.duration),
      releaseDate: toDateInputValue(movie.releaseDate),
    });
    clearFeedback("movies");
  }

  async function deleteMovie(movieId: number): Promise<void> {
    if (!window.confirm("Deseja remover este filme?")) {
      return;
    }

    clearFeedback("movies");

    try {
      const response = await fetch(`/api/movies/${movieId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage("movies", "Filme removido com sucesso.");
      if (editingMovieId === movieId) {
        resetMovieForm();
      }
      if (editingSessionId !== null && sessionForm.movieId === String(movieId)) {
        resetSessionForm();
      }
    } catch (error) {
      setErrorMessage("movies", error instanceof Error ? error.message : "Falha ao remover filme.");
    }
  }

  async function handleSessionSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    clearFeedback("sessions");
    setSessionSubmitting(true);

    try {
      const payload = {
        movieId: Number(sessionForm.movieId),
        roomId: Number(sessionForm.roomId),
        sessionTime: new Date(sessionForm.sessionTime).toISOString(),
      };

      const response = await fetch(
        editingSessionId === null ? "/api/sessions" : `/api/sessions/${editingSessionId}`,
        {
          method: editingSessionId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage(
        "sessions",
        editingSessionId === null ? "Sessao criada com sucesso." : "Sessao atualizada com sucesso."
      );
      resetSessionForm();
    } catch (error) {
      setErrorMessage("sessions", error instanceof Error ? error.message : "Falha ao salvar sessao.");
    } finally {
      setSessionSubmitting(false);
    }
  }

  function startSessionEdit(session: Session): void {
    setEditingSessionId(session.id);
    setSessionForm({
      movieId: String(session.movieId),
      roomId: String(session.roomId),
      sessionTime: toDateTimeInputValue(session.sessionTime),
    });
    clearFeedback("sessions");
  }

  async function deleteSession(sessionId: number): Promise<void> {
    if (!window.confirm("Deseja remover esta sessao?")) {
      return;
    }

    clearFeedback("sessions");

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage("sessions", "Sessao removida com sucesso.");
      if (editingSessionId === sessionId) {
        resetSessionForm();
      }
    } catch (error) {
      setErrorMessage("sessions", error instanceof Error ? error.message : "Falha ao remover sessao.");
    }
  }

  async function handleRoomSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    clearFeedback("rooms");
    setRoomSubmitting(true);

    try {
      const payload =
        editingRoomId === null
          ? {
              number: Number(roomForm.number),
              seatsCount: Number(roomForm.seatsCount),
            }
          : {
              number: Number(roomForm.number),
            };

      const response = await fetch(
        editingRoomId === null ? "/api/rooms" : `/api/rooms/${editingRoomId}`,
        {
          method: editingRoomId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage(
        "rooms",
        editingRoomId === null ? "Sala criada com sucesso." : "Sala atualizada com sucesso."
      );
      resetRoomForm();
    } catch (error) {
      setErrorMessage("rooms", error instanceof Error ? error.message : "Falha ao salvar sala.");
    } finally {
      setRoomSubmitting(false);
    }
  }

  function startRoomEdit(room: Room): void {
    setEditingRoomId(room.id);
    setRoomForm({
      number: String(room.number),
      seatsCount: "",
    });
    clearFeedback("rooms");
  }

  async function deleteRoom(roomId: number): Promise<void> {
    if (!window.confirm("Deseja remover esta sala?")) {
      return;
    }

    clearFeedback("rooms");

    try {
      const response = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage("rooms", "Sala removida com sucesso.");
      if (editingRoomId === roomId) {
        resetRoomForm();
      }
      if (editingSessionId !== null && sessionForm.roomId === String(roomId)) {
        resetSessionForm();
      }
      if (editingSeatId !== null && seatForm.roomId === String(roomId)) {
        resetSeatForm();
      }
    } catch (error) {
      setErrorMessage("rooms", error instanceof Error ? error.message : "Falha ao remover sala.");
    }
  }

  async function handleSeatSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    clearFeedback("seats");
    setSeatSubmitting(true);

    try {
      const payload = {
        roomId: Number(seatForm.roomId),
        number: Number(seatForm.number),
      };

      const response = await fetch(
        editingSeatId === null ? "/api/seats" : `/api/seats/${editingSeatId}`,
        {
          method: editingSeatId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage(
        "seats",
        editingSeatId === null ? "Assento criado com sucesso." : "Assento atualizado com sucesso."
      );
      resetSeatForm();
    } catch (error) {
      setErrorMessage("seats", error instanceof Error ? error.message : "Falha ao salvar assento.");
    } finally {
      setSeatSubmitting(false);
    }
  }

  function startSeatEdit(seat: Seat): void {
    setEditingSeatId(seat.id);
    setSeatForm({
      roomId: String(seat.roomId),
      number: String(seat.number),
    });
    clearFeedback("seats");
  }

  async function deleteSeat(seatId: number): Promise<void> {
    if (!window.confirm("Deseja remover este assento?")) {
      return;
    }

    clearFeedback("seats");

    try {
      const response = await fetch(`/api/seats/${seatId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await reloadAll();
      setSuccessMessage("seats", "Assento removido com sucesso.");
      if (editingSeatId === seatId) {
        resetSeatForm();
      }
    } catch (error) {
      setErrorMessage("seats", error instanceof Error ? error.message : "Falha ao remover assento.");
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-700">Carregando dados da administracao...</p>
      </section>
    );
  }

  if (requestError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-700">Erro ao carregar dados</h2>
        <p className="mt-2 text-rose-700">{requestError}</p>
        <button
          type="button"
          onClick={() => void reloadAll()}
          className="mt-4 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Usuarios</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={(event) => void handleUserSubmit(event)}>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Nome de usuario
            <input
              value={userForm.username}
              onChange={(event) => setUserForm((state) => ({ ...state, username: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              placeholder="Ex: maria"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Senha
            <input
              type="password"
              value={userForm.password}
              onChange={(event) => setUserForm((state) => ({ ...state, password: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              placeholder={editingUserId === null ? "Minimo 8 caracteres" : "Deixe em branco para manter"}
              autoComplete="new-password"
              required={editingUserId === null}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Perfil
            <select
              value={userForm.role}
              onChange={(event) =>
                setUserForm((state) => ({ ...state, role: event.target.value as "ADMIN" | "DEFAULT" }))
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="DEFAULT">Padrao</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={userSubmitting}
            >
              {userSubmitting ? "Salvando..." : editingUserId === null ? "Criar usuario" : "Atualizar usuario"}
            </button>
            {editingUserId !== null ? (
              <button
                type="button"
                onClick={resetUserForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        {success.users ? <p className="mt-3 text-sm font-medium text-emerald-700">{success.users}</p> : null}
        {errors.users ? <p className="mt-3 text-sm font-medium text-rose-700">{errors.users}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Usuario</th>
                <th className="px-2 py-2 font-medium">Perfil</th>
                <th className="px-2 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-700">{user.id}</td>
                  <td className="px-2 py-2 text-slate-800">{user.username}</td>
                  <td className="px-2 py-2 text-slate-700">{user.role === "ADMIN" ? "Administrador" : "Padrao"}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startUserEdit(user)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteUser(user.id)}
                        className="rounded-md border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-600" colSpan={4}>
                    Nenhum usuario cadastrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Filmes</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={(event) => void handleMovieSubmit(event)}>
          <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
            Nome
            <input
              value={movieForm.name}
              onChange={(event) => setMovieForm((state) => ({ ...state, name: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              placeholder="Nome do filme"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Duracao (min)
            <input
              type="number"
              min={1}
              value={movieForm.duration}
              onChange={(event) => setMovieForm((state) => ({ ...state, duration: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              placeholder="Ex: 120"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Data de estreia
            <input
              type="date"
              value={movieForm.releaseDate}
              onChange={(event) => setMovieForm((state) => ({ ...state, releaseDate: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            />
          </label>

          <div className="flex items-end gap-2 md:col-span-4">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={movieSubmitting}
            >
              {movieSubmitting
                ? "Salvando..."
                : editingMovieId === null
                  ? "Criar filme"
                  : "Atualizar filme"}
            </button>
            {editingMovieId !== null ? (
              <button
                type="button"
                onClick={resetMovieForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Cancelar edicao
              </button>
            ) : null}
          </div>
        </form>

        {success.movies ? <p className="mt-3 text-sm font-medium text-emerald-700">{success.movies}</p> : null}
        {errors.movies ? <p className="mt-3 text-sm font-medium text-rose-700">{errors.movies}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Nome</th>
                <th className="px-2 py-2 font-medium">Duracao</th>
                <th className="px-2 py-2 font-medium">Estreia</th>
                <th className="px-2 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-700">{movie.id}</td>
                  <td className="px-2 py-2 text-slate-800">{movie.name}</td>
                  <td className="px-2 py-2 text-slate-700">
                    {movie.duration === null ? "Nao informado" : `${movie.duration} min`}
                  </td>
                  <td className="px-2 py-2 text-slate-700">{toDisplayDate(movie.releaseDate)}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startMovieEdit(movie)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteMovie(movie.id)}
                        className="rounded-md border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {movies.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-600" colSpan={5}>
                    Nenhum filme cadastrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Sessoes</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={(event) => void handleSessionSubmit(event)}>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Filme
            <select
              value={sessionForm.movieId}
              onChange={(event) => setSessionForm((state) => ({ ...state, movieId: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              required
              disabled={movies.length === 0}
            >
              <option value="">Selecione</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.name} (id {movie.id})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Sala
            <select
              value={sessionForm.roomId}
              onChange={(event) => setSessionForm((state) => ({ ...state, roomId: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              required
              disabled={rooms.length === 0}
            >
              <option value="">Selecione</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Sala {room.number} (id {room.id})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Data e horario
            <input
              type="datetime-local"
              value={sessionForm.sessionTime}
              onChange={(event) => setSessionForm((state) => ({ ...state, sessionTime: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              required
              disabled={movies.length === 0 || rooms.length === 0}
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={sessionSubmitting || movies.length === 0 || rooms.length === 0}
            >
              {sessionSubmitting ? "Salvando..." : editingSessionId === null ? "Criar sessao" : "Atualizar sessao"}
            </button>
            {editingSessionId !== null ? (
              <button
                type="button"
                onClick={resetSessionForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        {movies.length === 0 || rooms.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Cadastre pelo menos um filme e uma sala antes de criar sessoes.</p>
        ) : null}
        {success.sessions ? <p className="mt-3 text-sm font-medium text-emerald-700">{success.sessions}</p> : null}
        {errors.sessions ? <p className="mt-3 text-sm font-medium text-rose-700">{errors.sessions}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Filme</th>
                <th className="px-2 py-2 font-medium">Sala</th>
                <th className="px-2 py-2 font-medium">Horario</th>
                <th className="px-2 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-700">{session.id}</td>
                  <td className="px-2 py-2 text-slate-800">
                    {moviesById.get(session.movieId)?.name ?? `Filme ${session.movieId}`}
                  </td>
                  <td className="px-2 py-2 text-slate-700">
                    Sala {roomsById.get(session.roomId)?.number ?? session.roomId}
                  </td>
                  <td className="px-2 py-2 text-slate-700">{toDisplayDateTime(session.sessionTime)}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startSessionEdit(session)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteSession(session.id)}
                        className="rounded-md border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-600" colSpan={5}>
                    Nenhuma sessao cadastrada.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Salas</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={(event) => void handleRoomSubmit(event)}>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Numero da sala
            <input
              type="number"
              min={1}
              value={roomForm.number}
              onChange={(event) => setRoomForm((state) => ({ ...state, number: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Quantidade de assentos
            <input
              type="number"
              min={1}
              value={roomForm.seatsCount}
              onChange={(event) => setRoomForm((state) => ({ ...state, seatsCount: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              disabled={editingRoomId !== null}
              required={editingRoomId === null}
              placeholder={editingRoomId === null ? "Ex: 80" : "Somente na criacao"}
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={roomSubmitting}
            >
              {roomSubmitting ? "Salvando..." : editingRoomId === null ? "Criar sala" : "Atualizar sala"}
            </button>
            {editingRoomId !== null ? (
              <button
                type="button"
                onClick={resetRoomForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        {success.rooms ? <p className="mt-3 text-sm font-medium text-emerald-700">{success.rooms}</p> : null}
        {errors.rooms ? <p className="mt-3 text-sm font-medium text-rose-700">{errors.rooms}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Numero</th>
                <th className="px-2 py-2 font-medium">Assentos</th>
                <th className="px-2 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const roomSeats = seats.filter((seat) => seat.roomId === room.id).length;
                return (
                  <tr key={room.id} className="border-b border-slate-100">
                    <td className="px-2 py-2 text-slate-700">{room.id}</td>
                    <td className="px-2 py-2 text-slate-800">{room.number}</td>
                    <td className="px-2 py-2 text-slate-700">{roomSeats}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startRoomEdit(room)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteRoom(room.id)}
                          className="rounded-md border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rooms.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-600" colSpan={4}>
                    Nenhuma sala cadastrada.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Assentos</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={(event) => void handleSeatSubmit(event)}>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Sala
            <select
              value={seatForm.roomId}
              onChange={(event) => setSeatForm((state) => ({ ...state, roomId: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              required
              disabled={rooms.length === 0}
            >
              <option value="">Selecione</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Sala {room.number} (id {room.id})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Numero do assento
            <input
              type="number"
              min={1}
              value={seatForm.number}
              onChange={(event) => setSeatForm((state) => ({ ...state, number: event.target.value }))}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
              required
              disabled={rooms.length === 0}
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={seatSubmitting || rooms.length === 0}
            >
              {seatSubmitting ? "Salvando..." : editingSeatId === null ? "Criar assento" : "Atualizar assento"}
            </button>
            {editingSeatId !== null ? (
              <button
                type="button"
                onClick={resetSeatForm}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        {rooms.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Crie pelo menos uma sala antes de cadastrar assentos.
          </p>
        ) : null}
        {success.seats ? <p className="mt-3 text-sm font-medium text-emerald-700">{success.seats}</p> : null}
        {errors.seats ? <p className="mt-3 text-sm font-medium text-rose-700">{errors.seats}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Sala</th>
                <th className="px-2 py-2 font-medium">Numero</th>
                <th className="px-2 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {seats.map((seat) => (
                <tr key={seat.id} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-700">{seat.id}</td>
                  <td className="px-2 py-2 text-slate-700">
                    {roomsById.get(seat.roomId)?.number ?? seat.roomId}
                  </td>
                  <td className="px-2 py-2 text-slate-800">{seat.number}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startSeatEdit(seat)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteSeat(seat.id)}
                        className="rounded-md border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {seats.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-600" colSpan={4}>
                    Nenhum assento cadastrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
