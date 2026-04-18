import type {
  ReportRepository,
  SessionOccupancyReportRow,
} from "@/core/domain/repositories/report-repository";

export class ListSessionOccupancyReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(): Promise<SessionOccupancyReportRow[]> {
    return this.reportRepository.listSessionOccupancy();
  }
}
