export interface UserMovieTicketsReportRow {
  movieId: number;
  movieName: string;
  ticketsBought: number;
  sessionsCount: number;
  lastSessionTime: Date | null;
}

export interface SessionOccupancyReportRow {
  sessionId: number;
  movieName: string;
  roomNumber: number;
  sessionTime: Date;
  seatsCapacity: number;
  soldTickets: number;
  occupancyRate: number;
}

export interface UserPurchaseSummaryReportRow {
  userId: number;
  username: string;
  ordersCount: number;
  ticketsCount: number;
  distinctMoviesCount: number;
  lastPurchaseAt: Date | null;
}

export interface ReportRepository {
  listMoviesBoughtByUser(userId: number): Promise<UserMovieTicketsReportRow[]>;
  listSessionOccupancy(): Promise<SessionOccupancyReportRow[]>;
  listUserPurchaseSummary(): Promise<UserPurchaseSummaryReportRow[]>;
}
