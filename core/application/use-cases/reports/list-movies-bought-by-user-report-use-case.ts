import { ApplicationError } from "@/core/application/errors/application-error";
import type {
  ReportRepository,
  UserMovieTicketsReportRow,
} from "@/core/domain/repositories/report-repository";

export class ListMoviesBoughtByUserReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(userId: number): Promise<UserMovieTicketsReportRow[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new ApplicationError("Field 'userId' must be a positive integer.", 400);
    }

    return this.reportRepository.listMoviesBoughtByUser(userId);
  }
}
