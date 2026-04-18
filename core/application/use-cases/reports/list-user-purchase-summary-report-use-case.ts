import type {
  ReportRepository,
  UserPurchaseSummaryReportRow,
} from "@/core/domain/repositories/report-repository";

export class ListUserPurchaseSummaryReportUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(): Promise<UserPurchaseSummaryReportRow[]> {
    return this.reportRepository.listUserPurchaseSummary();
  }
}
